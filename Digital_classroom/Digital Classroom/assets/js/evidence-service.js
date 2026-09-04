// assets/js/evidence-service.js
// First-Class Evidence Collection Layer & Real-time Synchronization

import { db, Fire, DEMO_STUDENTS } from "./firebase-config.js";

const EVIDENCE_LOCAL_KEY = "teacher_os_student_evidence";
const EVIDENCE_COLLECTION = "student_evidence";

// In-memory cache & listeners
let evidenceCache = [];
const subscribers = new Set();

/**
 * Standardized Evidence Model
 * @typedef {Object} StudentEvidence
 * @property {string} id
 * @property {string} studentId
 * @property {string} studentName
 * @property {string} classId
 * @property {string} className
 * @property {"TASK"|"OCR"|"EXAM"|"QUIZ"|"LIVE_QUIZ"|"COMPETITION"} sourceType
 * @property {string} sourceId
 * @property {string} sourceTitle
 * @property {string} subject
 * @property {string} topic
 * @property {string} skill
 * @property {number} score
 * @property {number} maxScore
 * @property {number} percentage
 * @property {Object} answers
 * @property {Array} mistakes
 * @property {number} attempts
 * @property {string} timestamp
 * @property {string} feedback
 */

function notifySubscribers() {
  const data = [...evidenceCache];
  subscribers.forEach((callback) => {
    try {
      callback(data);
    } catch (err) {
      console.error("[EvidenceService] Subscriber notification error:", err);
    }
  });
}

function loadLocalEvidence() {
  try {
    const raw = localStorage.getItem(EVIDENCE_LOCAL_KEY);
    if (raw) {
      evidenceCache = JSON.parse(raw);
    }
  } catch (e) {
    console.warn("[EvidenceService] Local evidence read error:", e);
  }
}

function saveLocalEvidence() {
  try {
    localStorage.setItem(EVIDENCE_LOCAL_KEY, JSON.stringify(evidenceCache));
  } catch (e) {
    console.error("[EvidenceService] Local evidence write error:", e);
  }
}

// Initial seed evidence if empty
export function seedInitialEvidence() {
  loadLocalEvidence();
  if (evidenceCache.length > 0) return evidenceCache;

  const now = new Date();
  const seed = [
    {
      id: "ev_001",
      studentId: "student_leo",
      studentName: "Leo Carter",
      classId: "class_bio_101",
      className: "Biology - Grade 10",
      sourceType: "EXAM",
      sourceId: "exam_bio_midterm",
      sourceTitle: "Midterm Biology Assessment",
      subject: "Biology",
      topic: "Photosynthesis",
      skill: "Application & Synthesis",
      score: 11,
      maxScore: 20,
      percentage: 55,
      answers: { Q1: "Light-dependent reactions occur in thylakoids", Q2: "Incorrect Calvin cycle equation" },
      mistakes: [
        { questionId: "Q2", questionText: "Calculate ATP yield in non-cyclic photophosphorylation", given: "4 ATP", expected: "6 ATP", concept: "ATP Synthase Stoichiometry" },
        { questionId: "Q4", questionText: "How does stomata closure affect carbon fixation under drought?", given: "Increases rate", expected: "Decreases due to CO2 depletion", concept: "Stomatal Resistance & Limiting Factors" }
      ],
      attempts: 1,
      timestamp: new Date(now.getTime() - 86400000 * 3).toISOString(),
      feedback: "Strong grasp on definition questions, but struggled with reaction mechanism and application."
    },
    {
      id: "ev_002",
      studentId: "student_maya",
      studentName: "Maya Lin",
      classId: "class_bio_101",
      className: "Biology - Grade 10",
      sourceType: "EXAM",
      sourceId: "exam_bio_midterm",
      sourceTitle: "Midterm Biology Assessment",
      subject: "Biology",
      topic: "Photosynthesis",
      skill: "Application & Synthesis",
      score: 19,
      maxScore: 20,
      percentage: 95,
      answers: { Q1: "Correct", Q2: "Correct" },
      mistakes: [],
      attempts: 1,
      timestamp: new Date(now.getTime() - 86400000 * 3).toISOString(),
      feedback: "Exemplary performance across analytical and application sections."
    },
    {
      id: "ev_003",
      studentId: "student_samira",
      studentName: "Samira Khan",
      classId: "class_bio_101",
      className: "Biology - Grade 10",
      sourceType: "OCR",
      sourceId: "task_handwritten_lab",
      sourceTitle: "Photosynthesis Lab Report & Equations",
      subject: "Biology",
      topic: "Photosynthesis",
      skill: "Chemical Equation Application",
      score: 12,
      maxScore: 20,
      percentage: 60,
      answers: { handwritten_formula: "6CO2 + 6H2O -> C6H12O6 + 6O2", diagram_notes: "Chloroplast thylakoid stack analysis" },
      mistakes: [
        { questionId: "Eq3", questionText: "Explain light saturation curve plateau", given: "Light stops working", expected: "CO2 concentration or Rubisco enzyme capacity becomes the rate-limiting factor", concept: "Rate Limiting Factors" }
      ],
      attempts: 1,
      timestamp: new Date(now.getTime() - 86400000 * 2).toISOString(),
      feedback: "Handwritten chemical balanced equations were extracted accurately. Theoretical explanation needs deeper synthesis."
    },
    {
      id: "ev_004",
      studentId: "student_alex",
      studentName: "Alex Rivera",
      classId: "class_bio_101",
      className: "Biology - Grade 10",
      sourceType: "LIVE_QUIZ",
      sourceId: "live_quiz_plant_cells",
      sourceTitle: "Live Quiz: Chloroplast & Cell Energy",
      subject: "Biology",
      topic: "Cellular Energy",
      skill: "Rapid Recall & Identification",
      score: 1400,
      maxScore: 2000,
      percentage: 70,
      answers: { Q1: "Chloroplast", Q2: "Stroma" },
      mistakes: [
        { questionId: "Q5", questionText: "Which pigment absorbs 680nm wavelength light?", given: "Chlorophyll b", expected: "Photosystem II (P680)", concept: "Absorption Spectra" }
      ],
      attempts: 1,
      timestamp: new Date(now.getTime() - 86400000).toISOString(),
      feedback: "Good response speed on structure identification, confused pigment absorption bands."
    },
    {
      id: "ev_005",
      studentId: "student_priya",
      studentName: "Priya Sharma",
      classId: "class_bio_101",
      className: "Biology - Grade 10",
      sourceType: "TASK",
      sourceId: "task_genetics_prob",
      sourceTitle: "Mendelian Genetics Punnett Grid",
      subject: "Biology",
      topic: "Genetics",
      skill: "Probability & Inheritance",
      score: 18,
      maxScore: 20,
      percentage: 90,
      answers: { Q1: "3:1 Phenotypic ratio", Q2: "1:2:1 Genotypic ratio" },
      mistakes: [],
      attempts: 1,
      timestamp: new Date(now.getTime() - 86400000 * 4).toISOString(),
      feedback: "Clear mastery of monohybrid and test crosses."
    },
    {
      id: "ev_006",
      studentId: "student_leo",
      studentName: "Leo Carter",
      classId: "class_bio_101",
      className: "Biology - Grade 10",
      sourceType: "COMPETITION",
      sourceId: "comp_science_bowl",
      sourceTitle: "Classroom Science Olympiad Round 1",
      subject: "Biology",
      topic: "Cellular Energy",
      skill: "Complex Problem Solving",
      score: 58,
      maxScore: 100,
      percentage: 58,
      answers: { Q1: "Partial solution" },
      mistakes: [
        { questionId: "C3", questionText: "Chemiosmotic proton gradient problem", given: "Active transport directly into stroma", expected: "Protons pumped into thylakoid lumen", concept: "Proton Gradient" }
      ],
      attempts: 1,
      timestamp: new Date(now.getTime() - 86400000 * 1).toISOString(),
      feedback: "Repeated error on proton gradient orientation observed in both exam and competition."
    }
  ];

  evidenceCache = seed;
  saveLocalEvidence();
  return evidenceCache;
}

export const EvidenceService = {
  /**
   * Records a new piece of evidence in Firestore and memory
   * @param {Omit<StudentEvidence, "id"|"timestamp">} evidenceInput
   * @returns {Promise<StudentEvidence>}
   */
  async recordEvidence(evidenceInput) {
    const id = "ev_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const timestamp = new Date().toISOString();

    const record = {
      id,
      timestamp,
      ...evidenceInput,
      percentage: evidenceInput.maxScore > 0 
        ? Math.round((evidenceInput.score / evidenceInput.maxScore) * 100) 
        : (evidenceInput.percentage || 0)
    };

    // Prepend to local cache
    evidenceCache.unshift(record);
    saveLocalEvidence();

    // Sync to Firestore if db is available
    if (db) {
      try {
        const docRef = Fire.doc(db, EVIDENCE_COLLECTION, id);
        await Fire.setDoc(docRef, {
          ...record,
          serverCreated: Fire.serverTimestamp()
        });
        console.info("[EvidenceService] Recorded evidence to Firestore:", id);
      } catch (err) {
        console.warn("[EvidenceService] Firestore write failed, preserved in local cache:", err.message);
      }
    }

    notifySubscribers();
    window.dispatchEvent(new CustomEvent("evidence-updated", { detail: record }));
    return record;
  },

  /**
   * Retrieves all evidence records
   */
  getAllEvidence() {
    if (evidenceCache.length === 0) {
      seedInitialEvidence();
    }
    return [...evidenceCache];
  },

  /**
   * Retrieves evidence records for a specific student
   */
  getEvidenceForStudent(studentId) {
    return this.getAllEvidence().filter(e => e.studentId === studentId);
  },

  /**
   * Retrieves evidence records for a specific class
   */
  getEvidenceForClass(classId) {
    return this.getAllEvidence().filter(e => !classId || e.classId === classId);
  },

  /**
   * Subscribes to evidence updates
   */
  subscribe(callback) {
    subscribers.add(callback);
    callback(this.getAllEvidence());

    // Firestore live listener
    let unsubscribeFirestore = null;
    if (db) {
      try {
        const q = Fire.query(
          Fire.collection(db, EVIDENCE_COLLECTION),
          Fire.orderBy("timestamp", "desc"),
          Fire.limit(50)
        );
        unsubscribeFirestore = Fire.onSnapshot(q, (snapshot) => {
          const remoteRecords = [];
          snapshot.forEach((doc) => remoteRecords.push({ id: doc.id, ...doc.data() }));
          if (remoteRecords.length > 0) {
            // Merge with local
            const map = new Map();
            evidenceCache.forEach(item => map.set(item.id, item));
            remoteRecords.forEach(item => map.set(item.id, item));
            evidenceCache = Array.from(map.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            saveLocalEvidence();
            notifySubscribers();
          }
        }, (err) => {
          console.warn("[EvidenceService] Firestore listener notice:", err.message);
        });
      } catch (err) {
        console.warn("[EvidenceService] Could not establish Firestore listener:", err);
      }
    }

    return () => {
      subscribers.delete(callback);
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  },

  /**
   * Computes high-level aggregated intelligence metrics from the evidence trail
   */
  aggregateIntelligence(classId = "class_bio_101") {
    const records = this.getEvidenceForClass(classId);
    if (!records.length) return null;

    const totalRecords = records.length;
    const avgScore = Math.round(records.reduce((sum, r) => sum + r.percentage, 0) / totalRecords);

    // Topic Performance Breakdown
    const topicMap = {};
    records.forEach(r => {
      const topic = r.topic || "General";
      if (!topicMap[topic]) topicMap[topic] = { total: 0, count: 0, mistakes: [] };
      topicMap[topic].total += r.percentage;
      topicMap[topic].count += 1;
      if (Array.isArray(r.mistakes)) {
        topicMap[topic].mistakes.push(...r.mistakes);
      }
    });

    const topicStats = Object.keys(topicMap).map(topic => ({
      topic,
      average: Math.round(topicMap[topic].total / topicMap[topic].count),
      count: topicMap[topic].count,
      mistakeCount: topicMap[topic].mistakes.length,
      sampleMistakes: topicMap[topic].mistakes.slice(0, 3)
    })).sort((a, b) => a.average - b.average);

    const weakestTopic = topicStats[0] || null;
    const strongestTopic = topicStats[topicStats.length - 1] || null;

    // Student Performance Breakdown
    const studentMap = {};
    records.forEach(r => {
      if (!studentMap[r.studentId]) {
        studentMap[r.studentId] = {
          studentId: r.studentId,
          studentName: r.studentName,
          scores: [],
          mistakes: [],
          evidenceCount: 0
        };
      }
      studentMap[r.studentId].scores.push(r.percentage);
      studentMap[r.studentId].evidenceCount += 1;
      if (Array.isArray(r.mistakes)) {
        studentMap[r.studentId].mistakes.push(...r.mistakes);
      }
    });

    const studentStats = Object.values(studentMap).map(s => {
      const avg = Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length);
      return {
        ...s,
        average: avg,
        status: avg < 65 ? "at-risk" : avg < 80 ? "steady" : "excelling",
        needsAttention: avg < 65 || s.mistakes.length >= 3
      };
    }).sort((a, b) => a.average - b.average);

    const atRiskStudents = studentStats.filter(s => s.needsAttention);

    return {
      totalRecords,
      classMastery: avgScore,
      topicStats,
      weakestTopic,
      strongestTopic,
      studentStats,
      atRiskStudents,
      recentEvidence: records.slice(0, 6)
    };
  }
};

// Initialize seed data on load
seedInitialEvidence();
