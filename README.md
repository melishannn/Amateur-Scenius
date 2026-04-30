<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🚀 Gemini AI Studio Application

**Google Gemini API ve Cloud Run kullanılarak geliştirilmiş modern yapay zeka uygulaması.**

[Canlı Demoyu Görüntüle](https://amateur-scenius-527887748922.europe-west1.run.app/) | [AI Studio Sayfası](https://ai.studio/apps/fbf7322e-7b56-4a0c-8a5a-e5bfdf9239ac)
</div>

---

## 📖 Proje Hakkında
Bu uygulama, Google AI Studio altyapısını kullanarak kullanıcı taleplerine akıllı çözümler üretmek amacıyla tasarlanmıştır. Backend tarafında Node.js, deployment tarafında ise ölçeklenebilir Google Cloud Run mimarisi tercih edilmiştir.

## 🛠️ Kurulum ve Yerel Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

### 1. Bağımlılıkları Yükleyin
Terminalinizi açın ve projenin ana dizininde şu komutu çalıştırın:
```bash
npm install 
```
### 2. Çevresel Değişkenleri Ayarlayın
Projenin ana dizininde .env.local adında bir dosya oluşturun ve içine Gemini API anahtarınızı ekleyin:
```bash 
Code snippet
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

### 3. Uygulamayı Başlatın
Geliştirme sunucusunu ayağa kaldırmak için:
``` bash
npm run dev 
```

### 🚀 Yayına Alma (Deployment)
Bu proje Google Cloud Run üzerinde barındırılmaktadır. Canlı sürüme aşağıdaki bağlantıdan ulaşabilirsiniz:
👉 https://amateur-scenius-527887748922.europe-west1.run.app/

### 📄 Lisans
Bu proje MIT lisansı altında korunmaktadır.
