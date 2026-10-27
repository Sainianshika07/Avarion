# Avarion — AI Fashion Makeover & Shopping Studio

Avarion is a web platform where users create a photo-based personal avatar, browse curated fashion items across major retailers (Amazon, Flipkart, Myntra, Ajio), preview outfits on their avatar, and shop directly via verified affiliate deep links.

---

## Features

- **Photo-Based 2D Avatar**: Upload a full-body photo or capture via camera. Real-time background isolation, body silhouette fitting, and 2D vector styling layers.
- **Multi-Retailer Catalog**: Browse clothing and accessories categorized by Men, Women, Kids, Footwear, Accessories, Makeup, and Trending collections.
- **Smart Recommendations**: Filter by occasion (Festive, Casual, Formal, Party), category, price, and store. Optional AI styling tips via Google Gemini API.
- **Affiliate & Deep Links**: Transparent product links with app deep-link support and clear affiliate disclosure compliant with retail partner policies.
- **Virtual Wardrobe & Lookbook**: Save favorite outfits and mix-and-match pieces across stores.

---

## Tech Stack

- **Frontend**: Plain HTML5, CSS3 (custom design system), Vanilla JavaScript (No heavy frameworks).
- **Backend**: Node.js + Express.js (cors, multer, node-fetch, dotenv).
- **Data Layer**: Clean structured JSON catalog (data/products.json) ready for database migration.
- **AI & Computer Vision**: Google Gemini API for styling insights, client-side Canvas & MediaPipe Pose for keypoint detection and alignment.

---

## Setup & Running

### 1. Prerequisites
- Node.js v18 or higher
- npm (comes with Node)

### 2. Installation


### 3. Environment Configuration
Copy the sample environment file:

Edit .env and add your optional keys:

*(The application runs fully in offline/mock mode even without third-party API keys).*

### 4. Start the Application

Open http://localhost:3000 in your browser.

---

## Application Structure



---

## Affiliate Disclosure
Avarion participates in affiliate marketing programs. When users click product links to retailer sites (such as Amazon, Flipkart, Myntra, or Ajio), Avarion may earn an affiliate commission at no additional cost to the shopper. Retailers do not permit automated cart checkout without direct enterprise partner APIs; all links redirect securely to official product pages.

---

## Roadmap

- [x] **Phase 0**: Project audit, cleanup, and documentation.
- [ ] **Phase 1**: Structured products.json catalog with sections (Men, Women, Kids, Footwear, Accessories, Makeup, Trending) and filterable /api/products API.
- [ ] **Phase 2**: Photo-based avatar upload with camera capture and 2D canvas try-on layering.
- [ ] **Phase 3**: AI-powered personalized styling suggestions and palette matching.
- [ ] **Phase 4**: Lookbook sharing, offline cart export, and mobile PWA support.
