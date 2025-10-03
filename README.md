# 🎮 Game Store Web

A full-stack **game store web application** where users can browse, purchase, and manage their game library.  
Built with **Flask (Python)**, **React (JavaScript)**, and **SQLite**.

---

## 👥 Team

- **[Eric Cun](https://github.com/Eric-Cun)**
- **[Quang Pham](https://github.com/boothedev)**

---

## 🚀 Features

- 🕹️ Browse games with detailed descriptions, screenshots, and achievements
- 🏷️ Filter games by tags, supported platforms, and languages
- 👤 User system with authentication, account balance, and game ownership
- ⭐ Rate and review games
- 📸 Game galleries with banners and screenshots
- 🔑 Admin controls for managing games and users

---

## 🗂️ Database Schema

Main entities include:

- **Games**: title, images, price, descriptions, developer/publisher info, release date
- **Users**: account details, balances, admin/active status
- **Tags, Platforms, Languages**: categorizations for games
- **Screenshots & Achievements**: one-to-many game assets
- **GameUsers**: many-to-many relation tracking ownership, ratings, and purchases
- **GameTags, GamePlatforms, GameLanguages**: many-to-many relations for metadata

---

## 🛠️ Tech Stack

- **Backend**: Flask (Python), SQLAlchemy
- **Frontend**: React (JavaScript), Vite, Tailwind CSS
- **Database**: SQLite
