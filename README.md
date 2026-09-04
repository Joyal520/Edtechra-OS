# Digital Classroom — Teacher OS V1

Digital Classroom is the first functional version of **Teacher OS**, an AI-powered teaching workspace built with **Firebase**.

Teacher OS is centered on the closed-loop pedagogical engine:

```text
Collect → Analyse → Understand → Decide → Review → Act → Measure → Collect Again
```

---

## 1. Product Architecture

```text
                    DIGITAL CLASSROOM (TEACHER OS)
                                  │
             ┌────────────────────┴────────────────────┐
             │                                         │
     EVIDENCE COLLECTION                      TEACHING INTELLIGENCE
             │                                         │
       ┌─────┼─────────┬─────────┐              • AI analyses evidence
       │     │         │         │              • AI identifies patterns & gaps
     Tasks  OCR      Exams    Quizzes           • Proactive recommendations
             │                 (Normal & Live)  • Grounded Teacher ↔ AI Chat
        Competitions                            • Decision Review & Interventions
             │                                         │
             └────────────────►────────────────────────┘
                               │
                       student_evidence
                               │
                        OUTPUT / ACTION
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
              Teacher       Student       Parent
           (Interventions/ (Assigned work/ (Progress updates/
            Command Center)  Live quiz)     Notifications)
```

---

## 2. Evidence Collection Layer

- **Tasks**: Create and assign curriculum tasks with instructions, questions, total marks, deadlines, and submission modes (text, file upload, or handwritten answer).
- **OCR Grading**: Seamlessly integrated into Tasks. Students photograph handwritten notebook or paper work; server-side OCR extracts handwriting, and AI evaluates equations & concepts against the rubric. Both original image and evaluation are preserved.
- **Exams Engine**: Based on Exam 2.0. Supports MCQ, True/False, and Short Answer application questions with duration timers, student preview, and statistical score analysis.
- **Quizzes**: Normal self-paced quizzes and **Real-Time Live Quizzes** with 6-digit game PINs, live question synchronization, and dynamic player scoreboards via Firebase Firestore.
- **Competitions**: Academic challenges and contests with points pools, time limits, and live rank leaderboards.

---

## 3. First-Class Evidence Model (`student_evidence`)

Tasks, OCR, Exams, Quizzes, and Competitions produce verifiable evidence records stored in the first-class Firestore collection **`student_evidence`**:
- `studentId`, `studentName`, `classId`, `className`
- `sourceType` (`TASK`, `OCR`, `EXAM`, `QUIZ`, `LIVE_QUIZ`, `COMPETITION`)
- `sourceId`, `sourceTitle`, `subject`, `topic`, `skill`
- `score`, `maxScore`, `percentage`
- `answers`, `mistakes` (concept, given, expected), `attempts`, `timestamp`, `feedback`

---

## 4. Teaching Intelligence (The Brain)

- **Class Intelligence**: Curriculum topic mastery rates, weakest topic detection (e.g. Photosynthesis application at 56%), and flagged at-risk students.
- **Student Intelligence**: Individual student deep-dives (Leo Carter, Maya Lin, Samira Khan, Alex Rivera, Priya Sharma), learning gaps, and chronological evidence trails.
- **AI Proactive Recommendations**: Problem → Evidence → AI Interpretation → Recommended Action cards.
- **AI Decision Review**: Teachers retain control with `[Ask AI Why?]`, `[Accept & Assign Activity]`, and `[Reject]`.
- **Grounded Teacher ↔ AI Chat**: Conversational AI assistant grounded strictly in Firestore evidence records, answering with verifiable student metrics.

---

## 5. Security & Firebase Credentials

- **Client Firebase**: Web Modular SDK v10 configured with the public project keys for `edtechra-teacher-os`.
- **Server Credentials**: Firebase Admin SDK credentials (`*-adminsdk-*.json`) and `.env` files are stored exclusively server-side and excluded via `.gitignore`. No private keys are exposed to client code or committed to GitHub.

---

## 6. Running Locally

```bash
cd "Digital_classroom/Digital Classroom"
npm start
```

Open in your browser:
- **Teacher Command Center**: `http://127.0.0.1:5173/teacher-dashboard.html`
- **Teaching Intelligence**: `http://127.0.0.1:5173/teaching-intelligence.html`
- **Tasks & OCR Lab**: `http://127.0.0.1:5173/activity-hub.html`
- **Exam Engine**: `http://127.0.0.1:5173/exam.html`
- **Live Quiz Host**: `http://127.0.0.1:5173/live_quiz-main/host-lobby.html`
- **Student Portal**: `http://127.0.0.1:5173/student-dashboard.html`
- **Announcements**: `http://127.0.0.1:5173/announcements.html`
