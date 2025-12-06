#  NeuroQ — AI‑Powered Mental Health Assistant

NeuroQ is a full‑stack AI-driven mental wellness platform built to help users track mental health, perform emotional check‑ins, chat with an empathetic AI, and monitor long‑term progress. It combines **FastAPI**, **React**, **Groq LLaMA models**, and **JSON/PostgreSQL storage** to deliver a modern, privacy‑first mental health solution.

---

## 🚀 Features

### ### **1. AI Mental Health Check‑ins**

* Users input symptoms, thoughts, mood, sleep hours, and stress level.
* Groq LLaMA‑3.1 generates:

  * Predicted disorder
  * Severity level
  * Confidence score
  * Recommendations
* Results are saved instantly.

### **2. AI Chatbot With Smart Title Generation**

* Multilingual AI chat (Hindi, Gujarati, Marathi, Telugu, English).
* Smart chat titles automatically generated from first user message.
* Full chat history stored locally.
* Customizable chat UI (theme, font size, autoscroll).

### **3. Personalized Dashboard**

* Recent check‑ins
* Last check‑in time
* Session‑only analytics
* Detailed analysis card for each check‑in

### **4. User Profile Management**

* Update username and full name
* Light/Dark mode
* Persistent user settings

### **5. Progress Report System**

* Full history of emotional & AI analysis records
* Delete any past report
* Clean UI with timestamps, confidence, recommendations

### **6. Stress Relief Activities Page**

Interactive links for:

* Online coloring
* Meditation
* Breathing exercises
* Music therapy
* Games for anxiety management

### **7. Footer & Navigation**

* Fully responsive top navigation bar
* Footer with About, Contact & Quick Links

---

## 🏗️ Tech Stack

### **Frontend:**

* React + Vite
* Zustand (auth state)
* TailwindCSS
* Heroicons
* React Router

### **Backend:**

* FastAPI
* Python 3.10–3.12
* Groq API (LLaMA 3.1 – 8B/70B Instant)
* PostgreSQL (or JSON DB for dev)
* Pydantic v2
* JWT Authentication

---

## 📁 Project Structure

```
NeuroQ/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── database.py
│   │   ├── schemas.py
│   │   ├── utils/security.py
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── chat.py
│   │       ├── checkin.py
│   │       ├── analyze.py
│   │       ├── language.py
│   │
│   ├── checkins.json (dev-only DB)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── store/authStore.js
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
```

---

## ⚙️ Installation

### **1️⃣ Clone the Repository**

```
git clone https://github.com/yourname/neuroq.git
cd neuroq
```

---

## 🐍 Backend Setup (FastAPI)

### **Create Virtual Environment**

```
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
```

### **Install Requirements**

```
pip install -r requirements.txt
```

### **Set Environment Variables**

Create a `.env` file inside `/backend`:

```
GROQ_API_KEY=your_api_key_here
SECRET_KEY=your_jwt_secret
ALGORITHM=HS256
```

### **Run Backend**

```
uvicorn app.main:app --reload --port 8000
```

Backend now runs on:
➡️ **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

Swagger Docs:
➡️ **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

---

## 🌐 Frontend Setup (React + Vite)

```
cd frontend
npm install
npm run dev
```

Frontend runs at:
➡️ **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Authentication Flow

1. User signs up → user stored in DB
2. User logs in → receives JWT token
3. JWT stored in Zustand + localStorage
4. Every API call attaches `Authorization: Bearer <token>`

---

## 🤖 Smart Chat Title Logic

Chat titles update only once per session using:

```
if (!currentSession.titleGenerated && smartTitle) {...}
```

This ensures stable, meaningful chat names.

---

## 📊 Check-in Storage Logic

Check-ins stored as JSON objects:

```
{
  "id": 1,
  "user_id": 12,
  "timestamp": "2025-12-05T12:00:00Z",
  "prediction": {
    "predicted_disorder": "Anxiety",
    "severity_level": "moderate",
    "confidence_score": 0.87
  }
}
```

---

## ✨ Key API Endpoints

### **Auth**

```
POST /auth/register
POST /auth/login
GET  /auth/me
PUT  /auth/update-profile
```

### **Chat**

```
POST /chat/  → AI reply + smart title
```

### **Check-ins**

```
POST /checkin/          → analyze + save
POST /checkin/save      → save manual prediction
GET  /checkin/          → history
GET  /checkin/stats     → totals + last check-in
GET  /checkin/recent    → last 5
DELETE /checkin/delete/{id}
```

---

## 📘 About NeuroQ

NeuroQ is designed to be a **safe, private, AI-powered companion** for mental wellness.
It helps users:

* Track emotions daily
* Reflect on mental health patterns
* Chat with a supportive AI assistant
* Learn coping strategies
* Visualize progress over time

NeuroQ is NOT a replacement for a licensed therapist.
It is a **self‑help support tool** to assist users in emotional awareness.

---

## 🧪 Testing

Run backend tests (if implemented):

```
pytest
```

---

## 📦 requirements.txt

```
fastapi
uvicorn
python-dotenv
pydantic
sqlalchemy
psycopg2-binary
groq
passlib[bcrypt]
python-jose
```

---

## 🛡️ Security

* JWT‑based authentication
* No sensitive data shared externally
* CORS-restricted origin
* Password hashing via bcrypt

---

## 🌐 Live Website
The platform is live! Visit us at [Neuro](https://neuroq-ai-powered-mental-health-9t5b.onrender.com) to track mental health! 

---

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](https://github.com/KushalZanzari/NeuroQ-AI-Powered-Mental-Health-Assistant/blob/main/LICENSE) file for more details. 

---

## ⚠️ Disclaimer
This platform is for informational and supportive purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with questions about medical conditions.

---

## 📧 Contact
For questions, feedback, or suggestions, please reach out at [kushalzanzari@gmail.com](mailto:kushalzanzari@gmail.com).

---

## 🙌 Credits

Developed by **Kushal Zanzari**

---













