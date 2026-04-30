const fs = require('fs');

function replaceStrings(content, file) {
  let newContent = content;

  if (file === 'Cabinet') {
    const replacements = [
      ["'Adım Adım Teknik Rehber'", "t('cabinet.types.technical')"],
      ["'Aaron Franklin Stili — Mutfağını Paylaş'", "t('cabinet.types.technical.headline')"],
      ["`Aaron Franklin her yıl barbekü tekniklerini anlatan saatler uzunluğunda videolar yayınlar. Sadece sonucu değil, fire build'i, et seçimini, sıcaklık kontrolünü — her aşamayı. Okuyucu seni \"izleyerek\" aynı sonuca ulaşabilmeli.`", "t('cabinet.types.technical.body')"],
      ["'\"İnsanlara nasıl yapıldığını göstermek, onları hem aydınlatır hem de sana bağlar.\" — Austin Kleon'", "t('cabinet.types.technical.quote')"],
      ["'Bu 6 içerik birbirini takip eden adımlarsa kullan.'", "t('cabinet.types.technical.when')"],
      ["{ label: 'Araçlar & Materyaller', hint: 'Hangi kütüphaneleri, araçları, ekipmanları kullandın? Okuyucu listeden alışveriş yapabilmeli.' }", "{ label: t('cabinet.types.p0_label'), hint: t('cabinet.types.p0_hint') }"],
      ["{ label: 'Aşama 1 — Hazırlık & Başlangıç', hint: 'Sıfırdan nasıl başladın? Kurulum, hazırlık, ilk adım.' }", "{ label: t('cabinet.types.p1_label'), hint: t('cabinet.types.p1_hint') }"],
      ["{ label: 'Aşama 2 — Asıl İş & İpuçları', hint: 'Ticari sırları paylaş. \"Normalde kimse şunu söylemez ama...\" diye başla.' }", "{ label: t('cabinet.types.p2_label'), hint: t('cabinet.types.p2_hint') }"],
      ["{ label: 'Aşama 3 — Sonuç & Hatalardan Dersler', hint: 'Ne çalıştı, ne çalışmadı? Bir dahaki sefere ne yapardın?' }", "{ label: t('cabinet.types.p3_label'), hint: t('cabinet.types.p3_hint') }"],
      
      ["'\"Nasıl Yaptım?\" Belgeseli'", "t('cabinet.types.documentary')"],
      ["'Sucuğun Nasıl Yapıldığını Göster'", "t('cabinet.types.documentary.headline')"],
      ["`İnsanlar \"sucuğun nasıl yapıldığını\" görmek ister. Sadece sonucu değil, mutfağı paylaş. Karşılaştığın duvarları, çıkmaz sokakları, \"ikinci perde\" zorluklarını — Kleon'un dediği \"throwing rocks\" anlarını — açık yüreklilikle yaz. Bu seni güvenilir kılar.`", "t('cabinet.types.documentary.body')"],
      ["'\"Başarı hikayeleri ilham verir, ama hata hikayeleri öğretir.\" — Austin Kleon'", "t('cabinet.types.documentary.quote')"],
      ["'Bu içerikler bir projenin farklı aşamalarındaki hataları ve başarıları temsil ediyorsa kullan.'", "t('cabinet.types.documentary.when')"],
      
      ["{ label: 'Başlangıçta Asıl Hedefin Neydi?', hint: 'Ne yapmak istiyordun? Başlarken ne hayal ediyordun?' }", "{ label: t('cabinet.types.d1_label'), hint: t('cabinet.types.d1_hint') }"],
      ["{ label: 'Throwing Rocks — İkinci Perde Zorlukları', hint: 'Nerede tökezledin? Hangi varsayımların yanlış çıktı? Utanmadan yaz.' }", "{ label: t('cabinet.types.d2_label'), hint: t('cabinet.types.d2_hint') }"],
      ["{ label: 'Sürecin Öğrettikleri', hint: 'Sonunda ne elde ettin? Bir dahaki sefere ne yapardın?' }", "{ label: t('cabinet.types.d3_label'), hint: t('cabinet.types.d3_hint') }"],

      ["'İlham ve Atıf Kitapçığı'", "t('cabinet.types.reading')"],
      ["'Açık Düğüm (Open Node) Ol'", "t('cabinet.types.reading.headline')"],
      ["`Kleon, kaynaklarını paylaşmanın seni \"açık bir düğüm\" yaptığını söyler — topluluğun içinde bir kavşak noktasısın. Seni besleyen kitapları, videoları, kişileri paylaştığında, başkalarına kendi öğrenme yolculuklarında harita veriyorsun.`", "t('cabinet.types.reading.body')"],
      ["'\"Başkalarına yol göster, onlar da seni takip eder.\" — Austin Kleon, Show Your Work'", "t('cabinet.types.reading.quote')"],
      ["'Bu içerikler öğrendiğin kaynaklar, okuduğun dokümanlar veya başkalarından kaptığın fikirlerden oluşuyorsa kullan.'", "t('cabinet.types.reading.when')"],

      ["{ label: 'Kitaplar & Makaleler', hint: 'Hangilerini okudun? Linkleriyle yaz. Neden öneriyor olduğunu bir cümleyle açıkla.' }", "{ label: t('cabinet.types.r1_label'), hint: t('cabinet.types.r1_hint') }"],
      ["{ label: 'Videolar, Podcastler, Kurslar', hint: 'Hangilerini izledin/dinledin? İnsanların bulabilmesi için bağlantı ver.' }", "{ label: t('cabinet.types.r2_label'), hint: t('cabinet.types.r2_hint') }"],
      ["{ label: 'Açık Düğümler — Takip Et', hint: 'Bu alanda kimleri takip etmeliyiz ve neden? \"Çünkü...\" diye açıkla.' }", "{ label: t('cabinet.types.r3_label'), hint: t('cabinet.types.r3_hint') }"],

      ["'\"Eski vs. Yeni\" Gelişim Şablonu'", "t('cabinet.types.oldVsNew')"],
      ["'Amatörlükten Ustalığa Yolculuk'", "t('cabinet.types.oldVsNew.headline')"],
      ["`\"Bu işe başladığımda ne bilmiyordum, şu an neyi farklı yapıyorum?\" kıyaslaması, okuyucuya hem mütevazılık hem de ilham verir. Yanlış inançlarını, yanılgılarını, köşe dönümlerini paylaş. Amatörlük bir başlangıç noktasıdır, utanılacak bir şey değil.`", "t('cabinet.types.oldVsNew.body')"],
      ["'\"Amatör olmak bir ayrıcalıktır — henüz merakı öldürülmemiş birisin.\" — Austin Kleon'", "t('cabinet.types.oldVsNew.quote')"],
      ["'Bu içerikler zaman içindeki değişimini gösteriyorsa — erken dönem vs. şimdiki hali — kullan.'", "t('cabinet.types.oldVsNew.when')"],

      ["{ label: 'Eskiden Ne Biliyordun?', hint: 'Hangi yanlış inançlara sahiptin? Neyi bilmiyordum diye şimdi güldüğün ne var? Dürüst ol.' }", "{ label: t('cabinet.types.o1_label'), hint: t('cabinet.types.o1_hint') }"],
      ["{ label: 'Şu An Neyi Farklı Yapıyorsun?', hint: 'En büyük kırılma anın ne oldu? Seni dönüştüren şey ne?' }", "{ label: t('cabinet.types.o2_label'), hint: t('cabinet.types.o2_hint') }"],
    ];

    replacements.forEach(([from, to]) => {
      newContent = newContent.replace(from, to);
    });

    newContent = newContent.replace(/<h4 className="text-xl font-bold text-text">ADIM 0 — Zaman Çizgisi \+ Seçim<\/h4>/g, "<h4 className=\"text-xl font-bold text-text\">{t('cabinet.step0.title')}</h4>");
    newContent = newContent.replace(/<p className="text-xs text-muted leading-relaxed">Birleştirmek istediğin fikirleri seç. Kleon felsefesi: "Noktaları birleştir, bütünü gör."<\/p>/g, "<p className=\"text-xs text-muted leading-relaxed\">{t('cabinet.step0.desc')}</p>");

    newContent = newContent.replace(/<div className="text-\[10px\] font-bold text-accent tracking-\[0.3em\] uppercase">ADIM 1 — ÖRÜNTÜ BULUNDU<\/div>/g, "<div className=\"text-[10px] font-bold text-accent tracking-[0.3em] uppercase\">{t('cabinet.step1.sub')}</div>");
    newContent = newContent.replace(/<h4 className="text-2xl font-bold text-text">Seçtiğin \{stockWizard.selectedPostIds.length\} fikir arasındaki ortak noktalar:<\/h4>/g, "<h4 className=\"text-2xl font-bold text-text\">{t('cabinet.step1.title', { count: stockWizard.selectedPostIds.length })}</h4>");
    newContent = newContent.replace(/<p className="text-xs text-muted">Aşağıdaki kelimeler seçtiğin fikirlerde en çok geçen örüntülerdir. Rehberinde vurgulamak istediklerini onayla.<\/p>/g, "<p className=\"text-xs text-muted\">{t('cabinet.step1.desc')}</p>");

    if (!newContent.includes('const { t } = useLanguage();')) {
      newContent = newContent.replace(/export default function Cabinet\({/g, "import { useLanguage } from '../contexts/LanguageContext';\nexport default function Cabinet({");
      newContent = newContent.replace(/const \[filter, setFilter\]/g, "const { t } = useLanguage();\n  const [filter, setFilter]");
    }
  }

  return newContent;
}

const cabinetStr = fs.readFileSync('src/components/Cabinet.tsx', 'utf8');
const newCabinet = replaceStrings(cabinetStr, 'Cabinet');
fs.writeFileSync('src/components/Cabinet.tsx', newCabinet);
