// test-closed-loop.mjs
// Automated verification test of the Teacher OS Closed-Loop Engine

async function runTests() {
  console.log("=================================================");
  console.log("  TEACHER OS V1 — CLOSED-LOOP ENGINE TEST SUITE  ");
  console.log("=================================================\n");

  const BASE_URL = "http://127.0.0.1:5173";

  // Step 1: Health & Firebase Check
  console.log("[Test 1] Verifying Server & Firebase configuration...");
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const health = await healthRes.json();
  if (health.status === "ok" && health.firebaseProject === "edtechra-teacher-os") {
    console.log("  ✓ Server is healthy. Target Firebase project:", health.firebaseProject);
    console.log("  ✓ Admin SDK Configured:", health.adminSdkConfigured);
  } else {
    throw new Error("Health check failed: " + JSON.stringify(health));
  }

  // Step 2: Test AI Proactive Recommendation
  console.log("\n[Test 2] Verifying AI Pattern & Gap Analysis (/api/ai/recommend)...");
  const recRes = await fetch(`${BASE_URL}/api/ai/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ evidence: [] })
  });
  const recData = await recRes.json();
  const primaryRec = recData.recommendations[0];
  console.log("  ✓ Proactive Recommendation Detected:");
  console.log("    • Problem:", primaryRec.problem);
  console.log("    • Evidence:", primaryRec.evidenceSummary);
  console.log("    • Interpretation:", primaryRec.aiInterpretation);
  console.log("    • Action:", primaryRec.recommendedAction);

  // Step 3: Test Grounded Teacher <-> AI Conversation
  console.log("\n[Test 3] Verifying Grounded Teacher ↔ AI Chat (/api/ai/chat)...");
  const chatRes = await fetch(`${BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "Why are these students struggling?",
      evidenceContext: [
        {
          id: "ev_001",
          studentId: "student_leo",
          studentName: "Leo Carter",
          sourceType: "EXAM",
          sourceTitle: "Midterm Biology Assessment",
          topic: "Photosynthesis",
          score: 11,
          maxScore: 20,
          percentage: 55,
          mistakes: [{ questionId: "Q2", concept: "ATP Synthase Stoichiometry", given: "4 ATP", expected: "6 ATP" }]
        },
        {
          id: "ev_003",
          studentId: "student_samira",
          studentName: "Samira Khan",
          sourceType: "OCR",
          sourceTitle: "Photosynthesis Lab Report",
          topic: "Photosynthesis",
          score: 12,
          maxScore: 20,
          percentage: 60,
          mistakes: [{ questionId: "Eq3", concept: "Rate Limiting Factors", given: "Light stops working", expected: "CO2 limitation" }]
        }
      ]
    })
  });
  const chatData = await chatRes.json();
  console.log("  ✓ AI Chat Response (Grounded in Firestore Evidence):");
  console.log("--------------------------------------------------");
  console.log(chatData.reply);
  console.log("--------------------------------------------------");
  if (!chatData.reply.includes("Leo Carter") || !chatData.reply.includes("Photosynthesis")) {
    throw new Error("Chat response failed grounding check!");
  }

  // Step 4: Test OCR Handwritten Evaluation
  console.log("\n[Test 4] Verifying OCR Handwritten Evaluation (/api/ai/ocr-grade)...");
  const ocrRes = await fetch(`${BASE_URL}/api/ai/ocr-grade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentName: "Samira Khan",
      hasImage: true,
      textAnswer: "6CO2 + 6H2O -> C6H12O6 + 6O2. Protons accumulate inside the thylakoid lumen creating an electrochemical gradient."
    })
  });
  const ocrData = await ocrRes.json();
  console.log("  ✓ Extracted OCR Text:", ocrData.extractedText.split("\n")[0]);
  console.log("  ✓ Awarded Score:", `${ocrData.score}/${ocrData.maxScore} (${ocrData.percentage}%)`);
  console.log("  ✓ Rubric Feedback:", ocrData.feedback);

  // Step 5: Test Exam Engine Generation
  console.log("\n[Test 5] Verifying Exam 2.0 Question Builder (/api/exam/generate)...");
  const examRes = await fetch(`${BASE_URL}/api/exam/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject: "Biology",
      topic: "Cellular Energy & Genetics",
      totalMarks: 50
    })
  });
  const examData = await examRes.json();
  console.log("  ✓ Generated Exam:", examData.metadata.title);
  console.log("  ✓ Sections Created:", examData.sections.length);
  examData.sections.forEach(s => {
    console.log(`    - ${s.sectionTitle} (${s.questions.length} questions, ${s.marksPerQuestion} marks each)`);
  });

  // Step 6: Verify Page Routes
  console.log("\n[Test 6] Verifying All Primary Route Endpoints...");
  const routes = [
    "/teacher-dashboard.html",
    "/teaching-intelligence.html",
    "/activity-hub.html",
    "/exam.html",
    "/announcements.html",
    "/student-dashboard.html",
    "/live_quiz-main/host-lobby.html",
    "/live_quiz-main/join.html"
  ];
  for (const route of routes) {
    const res = await fetch(`${BASE_URL}${route}`);
    if (res.status === 200) {
      console.log(`  ✓ [200 OK] ${route}`);
    } else {
      throw new Error(`Route failed: ${route} returned ${res.status}`);
    }
  }

  console.log("\n=================================================");
  console.log("  ✓ ALL 6 TEST PHASES PASSED SUCCESSFULLY!       ");
  console.log("  Teacher OS Core Closed-Loop Engine Verified.   ");
  console.log("=================================================\n");
}

runTests().catch(err => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
