// assets/js/intelligence-ui.js
// Teaching Intelligence Module - The Brain of Digital Classroom / Teacher OS

import { EvidenceService } from "./evidence-service.js";
import { DEMO_STUDENTS, getActiveSession } from "./firebase-config.js";

export class IntelligenceUI {
  static currentTab = "class"; // "class" | "student" | "recommendations" | "chat"
  static selectedStudentId = "student_leo";
  static recommendations = [];
  static chatHistory = [];

  static init() {
    this.fetchRecommendations();
    EvidenceService.subscribe((evidence) => {
      this.render();
    });
  }

  static async fetchRecommendations() {
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidence: EvidenceService.getAllEvidence() })
      });
      if (res.ok) {
        const data = await res.json();
        this.recommendations = data.recommendations || [];
        this.renderRecommendations();
      }
    } catch (e) {
      console.warn("[IntelligenceUI] Recommendations fetch error:", e);
    }
  }

  static render() {
    const root = document.getElementById("intelligence-root");
    if (!root) return;

    const intel = EvidenceService.aggregateIntelligence("class_bio_101");
    if (!intel) {
      root.innerHTML = `<div class="notice">Collecting evidence... Take or assign assessments to generate intelligence.</div>`;
      return;
    }

    this.renderHeaderSummary(intel);
    this.renderClassOverview(intel);
    this.renderStudentDetail(this.selectedStudentId);
    this.renderRecommendations();
  }

  static renderHeaderSummary(intel) {
    const masteryEl = document.getElementById("intel-class-mastery");
    const atRiskEl = document.getElementById("intel-at-risk-count");
    const weakestTopicEl = document.getElementById("intel-weakest-topic");
    const evidenceCountEl = document.getElementById("intel-evidence-count");

    if (masteryEl) masteryEl.textContent = `${intel.classMastery}%`;
    if (atRiskEl) atRiskEl.textContent = `${intel.atRiskStudents.length} Students`;
    if (weakestTopicEl) weakestTopicEl.textContent = intel.weakestTopic ? intel.weakestTopic.topic : "None";
    if (evidenceCountEl) evidenceCountEl.textContent = `${intel.totalRecords} Records`;
  }

  static renderClassOverview(intel) {
    const topicContainer = document.getElementById("intel-topics-list");
    const atRiskContainer = document.getElementById("intel-at-risk-list");
    const recentEvidenceContainer = document.getElementById("intel-recent-evidence-list");

    if (topicContainer) {
      topicContainer.innerHTML = intel.topicStats.map(t => {
        const isWeak = t.average < 65;
        const color = isWeak ? "var(--danger)" : t.average > 80 ? "var(--success)" : "var(--accent-blue)";
        return `
          <div class="intel-metric-row">
            <div class="intel-metric-info">
              <strong>${t.topic}</strong>
              <span>${t.count} assessments • ${t.mistakeCount} error patterns flagged</span>
            </div>
            <div class="intel-metric-bar-wrap">
              <div class="intel-progress-track">
                <div class="intel-progress-fill" style="width: ${t.average}%; background: ${color};"></div>
              </div>
              <span class="intel-score-badge" style="color: ${color}; font-weight: 700;">${t.average}%</span>
            </div>
          </div>
        `;
      }).join("");
    }

    if (atRiskContainer) {
      if (intel.atRiskStudents.length === 0) {
        atRiskContainer.innerHTML = `<div class="empty-state">No students currently flagged as at-risk. Class is on track!</div>`;
      } else {
        atRiskContainer.innerHTML = intel.atRiskStudents.map(s => `
          <div class="intel-student-alert-card">
            <div class="alert-card-left">
              <div class="student-avatar-circle">${s.studentName.split(" ").map(n => n[0]).join("")}</div>
              <div>
                <strong>${s.studentName}</strong>
                <span class="muted">${s.average}% mastery • ${s.mistakes.length} recurring mistakes</span>
              </div>
            </div>
            <div class="alert-card-actions">
              <button class="btn btn-secondary btn-sm" onclick="IntelligenceUI.selectStudent('${s.studentId}')">View Evidence</button>
              <button class="btn btn-primary btn-sm" onclick="IntelligenceUI.quickIntervene('${s.studentId}', '${s.studentName}')">Intervene</button>
            </div>
          </div>
        `).join("");
      }
    }

    if (recentEvidenceContainer) {
      recentEvidenceContainer.innerHTML = intel.recentEvidence.map(e => `
        <div class="intel-evidence-pill">
          <span class="badge badge-source badge-${e.sourceType.toLowerCase()}">${e.sourceType}</span>
          <div class="evidence-details">
            <div class="evidence-title"><strong>${e.studentName}</strong> • ${e.sourceTitle}</div>
            <div class="evidence-subtext">${e.topic} (${e.skill}) — ${e.score}/${e.maxScore} (${e.percentage}%)</div>
          </div>
          <span class="evidence-time">${new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      `).join("");
    }
  }

  static selectStudent(studentId) {
    this.selectedStudentId = studentId;
    this.renderStudentDetail(studentId);
    
    // Switch to student tab if available
    const studentTabBtn = document.querySelector('[data-tab="student"]');
    if (studentTabBtn) studentTabBtn.click();
  }

  static renderStudentDetail(studentId) {
    const container = document.getElementById("intel-student-detail-panel");
    if (!container) return;

    const student = DEMO_STUDENTS.find(s => s.id === studentId) || DEMO_STUDENTS[0];
    const evidence = EvidenceService.getEvidenceForStudent(student.id);

    const avg = evidence.length 
      ? Math.round(evidence.reduce((sum, e) => sum + e.percentage, 0) / evidence.length)
      : 0;

    const mistakes = evidence.flatMap(e => e.mistakes || []);

    container.innerHTML = `
      <div class="student-profile-header glass-panel">
        <div class="student-profile-main">
          <div class="student-avatar-lg">${student.avatar}</div>
          <div>
            <h2>${student.name}</h2>
            <p class="muted">${student.grade} • Biology - Grade 10 • ${student.email}</p>
          </div>
        </div>
        <div class="student-profile-stats">
          <div class="mini-stat">
            <span class="label">Average Mastery</span>
            <span class="value" style="color: ${avg < 65 ? 'var(--danger)' : 'var(--accent-blue)'};">${avg}%</span>
          </div>
          <div class="mini-stat">
            <span class="label">Evidence Items</span>
            <span class="value">${evidence.length}</span>
          </div>
          <div class="mini-stat">
            <span class="label">Logged Gaps</span>
            <span class="value">${mistakes.length}</span>
          </div>
        </div>
      </div>

      <div class="two-col-grid grid mt-20">
        <div class="glass-panel section-surface">
          <h3>Identified Learning Gaps & Repeated Mistakes</h3>
          <div class="mistakes-stream mt-12">
            ${mistakes.length === 0 ? `<p class="muted">No learning gaps detected for ${student.name}. Excellent comprehension!</p>` : ""}
            ${mistakes.map(m => `
              <div class="mistake-item-card">
                <div class="concept-tag">${m.concept || "Concept Gap"}</div>
                <div class="mistake-q"><strong>Question:</strong> ${m.questionText}</div>
                <div class="mistake-diff">
                  <span class="given-ans"><strong>Given:</strong> ${m.given}</span>
                  <span class="expected-ans"><strong>Expected:</strong> ${m.expected}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="glass-panel section-surface">
          <h3>Evidence Trail (${evidence.length} Records)</h3>
          <div class="evidence-timeline mt-12">
            ${evidence.map(e => `
              <div class="timeline-entry">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div class="timeline-head">
                    <span class="badge badge-${e.sourceType.toLowerCase()}">${e.sourceType}</span>
                    <strong>${e.sourceTitle}</strong>
                    <span class="score-chip">${e.percentage}%</span>
                  </div>
                  <p class="timeline-feedback">${e.feedback || "Completed assessment."}</p>
                  <small class="muted">${new Date(e.timestamp).toLocaleDateString()} at ${new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }

  static renderRecommendations() {
    const container = document.getElementById("intel-recommendations-list");
    if (!container) return;

    if (this.recommendations.length === 0) {
      container.innerHTML = `<div class="empty-state">No pending AI recommendations. Teaching Intelligence is evaluating incoming student evidence.</div>`;
      return;
    }

    container.innerHTML = this.recommendations.map(rec => `
      <div class="recommendation-card glass-panel" id="${rec.id}">
        <div class="rec-header">
          <div class="rec-badge"><span class="icon-sparkle">✨</span> AI RECOMMENDATION</div>
          <span class="status-pill status-${rec.status}">${rec.status.toUpperCase()}</span>
        </div>

        <div class="rec-problem">
          <h4>${rec.problem}</h4>
        </div>

        <div class="rec-grid">
          <div class="rec-block evidence-block">
            <span class="block-title">VERIFIABLE EVIDENCE</span>
            <p>${rec.evidenceSummary}</p>
          </div>
          <div class="rec-block interpretation-block">
            <span class="block-title">AI INTERPRETATION</span>
            <p>${rec.aiInterpretation}</p>
          </div>
        </div>

        <div class="rec-action-box">
          <span class="block-title">RECOMMENDED ACTION</span>
          <p class="action-desc"><strong>${rec.recommendedAction}</strong></p>
        </div>

        <div class="rec-footer-actions">
          <button class="btn btn-secondary" onclick="IntelligenceUI.askAiAboutRec('${rec.id}')">
            <span data-icon="sparkles"></span> Ask AI Why?
          </button>
          <div class="action-buttons-group">
            <button class="btn btn-primary" onclick="IntelligenceUI.acceptRecommendation('${rec.id}')">
              Accept & Assign Activity
            </button>
            <button class="btn btn-ghost text-danger" onclick="IntelligenceUI.rejectRecommendation('${rec.id}')">
              Reject
            </button>
          </div>
        </div>
      </div>
    `).join("");
  }

  static async acceptRecommendation(recId) {
    const rec = this.recommendations.find(r => r.id === recId);
    if (!rec) return;

    rec.status = "accepted";
    this.renderRecommendations();

    // Create intervention task
    alert(`Intervention Assigned Successfully!\n\nTask: "20-Min Targeted Revision: Photophosphorylation Mechanisms"\nAssigned to: ${rec.targetStudentNames?.join(", ") || "Selected Students"}\nDeadline: 2 days\n\nStudents will see this in their Task stream.`);
    
    // Announce to students
    window.dispatchEvent(new CustomEvent("create-announcement", {
      detail: {
        title: "Targeted Revision Assigned: Photosynthesis Mechanisms",
        message: "Your teacher has assigned a short 20-minute targeted inquiry activity to consolidate light reaction concepts.",
        recipientType: "student",
        priority: "high"
      }
    }));
  }

  static rejectRecommendation(recId) {
    const rec = this.recommendations.find(r => r.id === recId);
    if (rec) {
      rec.status = "rejected";
      this.renderRecommendations();
    }
  }

  static askAiAboutRec(recId) {
    const rec = this.recommendations.find(r => r.id === recId);
    if (!rec) return;

    // Open chat with question
    this.openChat();
    this.sendChatMessage(`What caused this recommendation: "${rec.problem}"? Show me the exact assessment breakdown.`);
  }

  static quickIntervene(studentId, studentName) {
    this.openChat();
    this.sendChatMessage(`Create a 20-minute intervention activity for ${studentName} focusing on their recent learning gaps.`);
  }

  // Teacher ↔ AI Chat Interface
  static openChat() {
    const chatDrawer = document.getElementById("intel-chat-drawer");
    if (chatDrawer) {
      chatDrawer.classList.add("open");
    }
  }

  static closeChat() {
    const chatDrawer = document.getElementById("intel-chat-drawer");
    if (chatDrawer) {
      chatDrawer.classList.remove("open");
    }
  }

  static async sendChatMessage(promptText = null) {
    const input = document.getElementById("intel-chat-input");
    const text = promptText || input?.value?.trim();
    if (!text) return;

    if (input && !promptText) input.value = "";

    const msgContainer = document.getElementById("intel-chat-messages");
    if (msgContainer) {
      // User message
      msgContainer.insertAdjacentHTML("beforeend", `
        <div class="chat-msg user-msg">
          <div class="msg-bubble">${this.escape(text)}</div>
        </div>
      `);
      msgContainer.scrollTop = msgContainer.scrollHeight;

      // Typing indicator
      const typingId = "typing_" + Date.now();
      msgContainer.insertAdjacentHTML("beforeend", `
        <div class="chat-msg ai-msg" id="${typingId}">
          <div class="msg-bubble typing-bubble">
            <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
            Consulting Firestore evidence...
          </div>
        </div>
      `);
      msgContainer.scrollTop = msgContainer.scrollHeight;

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: text,
            evidenceContext: EvidenceService.getAllEvidence(),
            studentId: this.selectedStudentId,
            classId: "class_bio_101"
          })
        });

        document.getElementById(typingId)?.remove();

        if (res.ok) {
          const data = await res.json();
          msgContainer.insertAdjacentHTML("beforeend", `
            <div class="chat-msg ai-msg">
              <div class="ai-avatar">✨</div>
              <div class="msg-bubble formatted-reply">
                ${this.formatMarkdown(data.reply)}
                ${data.actionSuggestion ? `
                  <div class="chat-action-box mt-8">
                    <button class="btn btn-primary btn-sm" onclick="alert('Intervention activity automatically scheduled and assigned to student task queue!')">
                      Approve & Assign Activity
                    </button>
                  </div>
                ` : ""}
              </div>
            </div>
          `);
        } else {
          msgContainer.insertAdjacentHTML("beforeend", `
            <div class="chat-msg ai-msg">
              <div class="msg-bubble error-bubble">Unable to retrieve AI response. Check network.</div>
            </div>
          `);
        }
      } catch (err) {
        document.getElementById(typingId)?.remove();
        console.error(err);
      }

      msgContainer.scrollTop = msgContainer.scrollHeight;
    }
  }

  static formatMarkdown(text = "") {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/### (.*?)\n/g, "<h4>$1</h4>")
      .replace(/• (.*?)\n/g, "<li>$1</li>")
      .replace(/\n\n/g, "<br><br>");
  }

  static escape(str = "") {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[c]));
  }
}

// Global hook for inline handlers
window.IntelligenceUI = IntelligenceUI;
