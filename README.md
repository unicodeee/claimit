# 🧭 Claimit — SJSU Lost & Found Platform

A simple, fast, and student-friendly lost & found service built for **San José State University**.
Claimit helps Spartans reconnect with their lost belongings by making it easy to **post**, **search**, and **claim** items through a clean and intuitive web interface.

---

## 🚀 Features

* 🎒 **Post Lost or Found Items** — Upload photos, descriptions, categories, and locations.
* 🔍 **Fast Search** — Quickly browse or filter by item type, date, or tags.
* 🔔 **Claim Requests** — Found an item? Notify the owner. Lost something? Request verification.
* 🔐 **Secure Login** — Firebase-based authentication for SJSU students.
* 📱 **Mobile-Friendly** — Works seamlessly on phones, tablets, and desktops.
* 🏫 **Built for SJSU** — Tailored for campus life, locations, and student needs, only domain @sjsu.edu allowed.

---

## 📦 Tech Stack

* **Next.js** — Frontend & API routes
* **Firebase** — Auth, Firestore, Storage
* **Tailwind CSS** — Styling
* **Vercel** — Deployment (optional)

---

## 🛠 Installation

Clone the repository:

```bash
git clone <your-repo-url>
cd claimit
npm install
```

---

## 🔧 Environment Setup

Create a `.env` file in the **root directory (`claimit/`)** and add the following Firebase credentials:

```bash
NEXT_PUBLIC_FBASE_APIKEY=
NEXT_PUBLIC_FBASE_AUTHDOMAIN=
NEXT_PUBLIC_FBASE_PROJECTID=
NEXT_PUBLIC_FBASE_STORAGEBUCKET=
NEXT_PUBLIC_FBASE_MESSAGINGSENDERID=
NEXT_PUBLIC_FBASE_APPID=
NEXT_PUBLIC_FBASE_MEASUREMENTID=
```

Make sure these values match your Firebase project settings.

---

## ▶️ Development Server

Start the local development server:

```bash
npm run dev
```

Then open:
👉 [http://localhost:3000](http://localhost:3000)

You should now see the Claimit app running locally.

---

## 📁 Project Structure

```
claimit/
├─ app/        
    ├─ api/        
    ├─ components/   # Reusable UI components
    ├─ lib/          # Objects validators lib
    ├─ main/         # Main route
    ...
├─ lib/               # Firebase config, helpers
├─ public/            # Static assets
└─ .env               # Environment variables
```

---

## 🚀 Deployment

You can deploy on:

* **Vercel** (recommended for Next.js)
* Firebase Hosting
* Any Node-compatible hosting platform

Build for production:

```bash
npm run build
npm start
```

---

## 🤝 Contributing

Contributions are welcome!
Feel free to open issues or submit pull requests to improve the SJSU lost & found experience.

---

## 📄 License

MIT License — Free to use, modify, and share.

---

If you'd like, I can also:
✅ add badges (Vercel, Firebase, Node version, etc.)
✅ make this into a Markdown file
✅ generate a logo or banner for the README
Just tell me!
