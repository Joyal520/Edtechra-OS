// assets/js/firebase-config.js
// Firebase Web SDK (Modular v10.12.5) loaded directly via Google CDN

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  increment,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyA-tAJXjZtp2ez9DgpYPODwLOPO_TWm6FA",
  authDomain: "edtechra-teacher-os.firebaseapp.com",
  projectId: "edtechra-teacher-os",
  storageBucket: "edtechra-teacher-os.firebasestorage.app",
  messagingSenderId: "903314248757",
  appId: "1:903314248757:web:d838b1ecdc97f19f708d7c",
  measurementId: "G-2ZRZQJFJN6"
};

let appInstance = null;
let dbInstance = null;
let authInstance = null;
let isFirebaseOnline = false;

try {
  appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  dbInstance = getFirestore(appInstance);
  authInstance = getAuth(appInstance);
  isFirebaseOnline = true;
  console.info("[Firebase] Successfully initialized with project:", firebaseConfig.projectId);
} catch (err) {
  console.warn("[Firebase] Client initialization notice (will run in resilient hybrid mode):", err);
}

export const app = appInstance;
export const db = dbInstance;
export const auth = authInstance;

export const Fire = {
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  increment,
  limit
};

// Current Session State
const SESSION_KEY = "teacher_os_active_session";

export function getActiveSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load active session from localStorage:", e);
  }
  // Default Teacher Session
  return {
    uid: "teacher_sarah_jenkins",
    displayName: "Sarah Jenkins",
    email: "sarah.jenkins@edtechra.edu",
    role: "teacher",
    activeClassId: "class_bio_101",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  };
}

export function setActiveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent("session-changed", { detail: session }));
  } catch (e) {
    console.error("Failed to save active session:", e);
  }
  return session;
}

export function clearActiveSession() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent("session-changed", { detail: null }));
}

// Student personas for pair-testing
export const DEMO_STUDENTS = [
  { id: "student_leo", name: "Leo Carter", email: "leo.carter@school.edu", classId: "class_bio_101", grade: "Grade 10", avatar: "LC" },
  { id: "student_maya", name: "Maya Lin", email: "maya.lin@school.edu", classId: "class_bio_101", grade: "Grade 10", avatar: "ML" },
  { id: "student_samira", name: "Samira Khan", email: "samira.khan@school.edu", classId: "class_bio_101", grade: "Grade 10", avatar: "SK" },
  { id: "student_alex", name: "Alex Rivera", email: "alex.rivera@school.edu", classId: "class_bio_101", grade: "Grade 10", avatar: "AR" },
  { id: "student_priya", name: "Priya Sharma", email: "priya.sharma@school.edu", classId: "class_bio_101", grade: "Grade 10", avatar: "PS" }
];

export async function ensureTeacherAuth() {
  const current = getActiveSession();
  if (current && current.role === "teacher") return current;

  const defaultTeacher = {
    uid: "teacher_sarah_jenkins",
    displayName: "Sarah Jenkins",
    email: "sarah.jenkins@edtechra.edu",
    role: "teacher",
    activeClassId: "class_bio_101"
  };
  setActiveSession(defaultTeacher);
  return defaultTeacher;
}

export async function switchUserRole(role = "teacher", studentId = null) {
  if (role === "student") {
    const student = DEMO_STUDENTS.find(s => s.id === studentId) || DEMO_STUDENTS[0];
    const session = {
      uid: student.id,
      displayName: student.name,
      email: student.email,
      role: "student",
      activeClassId: student.classId,
      studentId: student.id,
      grade: student.grade
    };
    setActiveSession(session);
    return session;
  } else {
    const session = {
      uid: "teacher_sarah_jenkins",
      displayName: "Sarah Jenkins",
      email: "sarah.jenkins@edtechra.edu",
      role: "teacher",
      activeClassId: "class_bio_101"
    };
    setActiveSession(session);
    return session;
  }
}
