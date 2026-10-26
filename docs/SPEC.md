# Technical Specification: Avarion - AI Fashion & Virtual Makeover Studio

**Created:** 2026-10-10  
**PRD Reference:** `docs/PRD.md`  
**Architecture Status:** Approved  

---

## 1. System Architecture Overview

Avarion is structured as a high-performance, responsive client-side web application with a lightweight Node.js/Express service for proxying affiliate catalog feeds and persisting user wardrobes.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Avarion Frontend                             │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────┐ │
│  │   2D Studio (Interactive Canvas & SVG Layers)│  │ Virtual Wardrobe UI  │  │ Lookbook &   │ │
│  │   - Modular Layer Canvas   │  │ - Occasion Filters   │  │ Cart Handoff │ │
│  │   - Realtime Color & Alpha Tinting     │  │ - Realtime Morphing  │  │ - Affiliate  │ │
│  │   - Direct Drag & Pan Controls    │  │ - Color Pickers      │  │   Tracking   │ │
│  └───────────┬───────────┘  └──────────┬───────────┘  └──────┬───────┘ │
└──────────────┼─────────────────────────┼─────────────────────┼─────────┘
               │                         │                     │
               ▼                         ▼                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Backend / Service Layer                         │
│  - Express REST APIs (/api/outfits, /api/trends, /api/affiliate)       │
│  - In-memory / JSON Cache for catalog feeds                            │
│  - Deep Link Generator with Affiliate ID tagging                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Tokens & Visual Language
Following the `design-taste-frontend` specification:
- **Design Read:** Minimal Utilitarian Editorial / Clean Monochrome with warm off-white, crisp slate borders (#EAEAEA / #222), and spot muted pastels.
- **Color Tokens:**
  - Background: `#0B0C10` (Obsidian Canvas)
  - Surface Glass: `rgba(22, 24, 33, 0.75)` with `backdrop-filter: blur(16px)`
  - Primary Accent: `#D4AF37` / `#E5C158` (Champagne Gold / Metallic Sheen)
  - Secondary Accent: `#FF5E7E` (Coral Rose for Beauty & Highlights)
  - Text Primary: `#F5F6FA`
  - Text Secondary: `#9A9EAF`
  - Borders: `rgba(255, 255, 255, 0.1)`
- **Typography:**
  - Headings: `Playfair Display`, serif (Editorial elegance)
  - Body & Controls: `Plus Jakarta Sans`, sans-serif (Modern, readable, clean)

---

## 3. Component Hierarchy & Contracts

### 3.1 `ParametricAvatar` (Three.js Module)
- **Geometry:** Procedural anatomical mannequin with adjustable vertex groups:
  - `height`: Scales Y-axis spine and leg bones.
  - `chest`: Modulates upper torso vertices.
  - `waist`: Modulates mid-torso cinch factor.
  - `hips`: Modulates lower pelvic geometry.
  - `skinTone`: Custom PBR shader material (`MeshPhysicalMaterial`) responding to realistic environmental studio lighting.
- **Layering System:**
  - Layer 0: Skin / Base Mannequin
  - Layer 1: Makeup (Facial decals / Lip & Eye specular shader)
  - Layer 2: Inner garments (Tops, Bodysuits, Shirts)
  - Layer 3: Outer garments (Blazers, Jackets, Overcoats)
  - Layer 4: Bottoms (Trousers, Skirts, Shorts)
  - Layer 5: Footwear (Sneakers, Heels, Boots)

### 3.2 `OccasionEngine`
- Categories:
  - `College Fest / Casual`: Streetwear, oversized tees, sneakers, cargo pants.
  - `Corporate / Formal`: Tailored suits, pencil skirts, formal oxfords/loafers.
  - `Wedding / Festive`: Traditional ethnic ensembles, sherwanis, sarees, festive accessories.
  - `Evening / Gala`: Cocktail dresses, evening gowns, stiletto heels, bold glam makeup.

### 3.3 `AffiliateHandoff`
- Deep link schema:
  - Amazon: `https://www.amazon.in/dp/{ASIN}?tag={AFFILIATE_TAG}`
  - Flipkart: `https://www.flipkart.com/{SLUG}?affid={AFFILIATE_TAG}`
  - Myntra: `https://www.myntra.com/{ITEM_ID}?utm_source=avarion_affiliate`

---

## 4. API Specification

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `GET /api/catalog` | GET | Returns curated clothing and accessory items by occasion and gender. |
| `GET /api/trends` | GET | Returns trending style cards with current hype scores and tags. |
| `POST /api/lookbook/export` | POST | Saves a curated look and returns shareable summary metadata. |

---

## 5. Implementation Roadmap
1. **Milestone 1:** Three.js 3D Mannequin with real-time parametric sliders (height, chest, waist, hips, skin tone).
2. **Milestone 2:** Modular Try-on layer system (outfits, footwear, makeup accents).
3. **Milestone 3:** Occasion trend browser & affiliate link generation.
4. **Milestone 4:** Full integration test & end-to-end responsiveness check.
