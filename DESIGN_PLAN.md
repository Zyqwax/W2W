# W2W arayüzünü yeniden tasarlama planı

## Hedef

W2W'yi film bulmayı ve kişisel izleme geçmişini yönetmeyi kolaylaştıran, ilk kullanımda anlaşılır ve telefonda rahat kullanılan bir ürüne dönüştürmek. Arayüz TMDB kataloğuna dayalı bir film keşif ve takip uygulaması olarak kalır; mevcut işlevler korunur, görsel dil ve bilgi mimarisi yeniden kurulur.

## Araştırmadan çıkan kararlar

- Film keşfinde tek bir davranış yok. 2026 tarihli, Norveç'te 1.501 kişiyle yapılan yayınlanmış ankette katılımcıların %88'i aramayı, %76'sı kategori veya tür keşfini, %84'ü aile/arkadaş önerilerini kullandığını bildirdi. Örneklem tek ülkeye ait; oranları W2W kullanıcılarına genellemek yerine arama, gezinme ve sosyal öneriyi ayrı desteklemek için yön gösterici kabul ediyoruz. [Araştırma makalesi](https://journals.sagepub.com/doi/full/10.1177/15274764251410583)
- Arayan kullanıcı ile gezinerek keşfeden kullanıcı aynı başlangıç ekranında yolunu bulabilmeli. Arama her ana ekrandan erişilebilir olmalı ve keşif kategorileri de görünür kalmalı. [Nielsen Norman Group: Search and You May Find](https://www.nngroup.com/articles/search-and-you-may-find/)
- Kullanıcının listesine eklediği, izlediği veya izleme durumunu değiştirdiği film arayüzde kaybolmamalı. Kaydetme, izleme ve hata durumları kısa ve görünür geri bildirim vermeli. [Nielsen Norman Group: Visibility of System Status](https://www.nngroup.com/articles/visibility-system-status/)
- Watchlist ile özel listelerin amacı farklı ve adları da bu farkı açık anlatmalı: watchlist izlenecek filmleri biriktirir; özel listeler seçilmiş temalara göre düzenlenir. [Letterboxd yardım merkezi](https://letterboxd.zendesk.com/hc/en-us/articles/15179261056143-What-s-the-difference-between-my-lists-and-my-watchlist)
- Mobil dokunma kontrolleri en az WCAG 2.2 AA'nın 24×24 CSS piksel minimum hedefini veya yeterli aralığı karşılamalı; önemli birincil aksiyonlar bundan daha büyük tasarlanmalı. [W3C WCAG 2.2: Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)

## Tasarım yönü

**Sıcak, sakin ve editoryal.** Karanlık, neon ve yoğun sinema afişi estetiği yerine açık, sıcak nötr zemin; koyu mürekkep rengi metin; tek belirgin mavi/menekşe aksan; ölçülü mercan rengi durum vurgusu. Film posterleri ve backdrop'lar zaten güçlü renk taşıdığı için çevre arayüz sade kalır. İsteğe bağlı koyu tema daha sonra aynı token'larla eklenebilir.

- Mobil öncelikli, geniş ekranda içerik sınırı ve sol navigasyon.
- Belirgin tipografik hiyerarşi, kısa açıklamalar ve tutarlı boşluk ölçeği.
- Poster kartı tek başına etkileşim saklamaz: detay, izleme listesine ekle ve izlendi olarak işaretle aksiyonları görünür ve erişilebilir olur.
- Renk tek başına durum belirtmez; ikon ve metin birlikte kullanılır.
- Hareket kısa ve yardımcı olur; sistem azaltılmış hareket tercihine uyar.

## Önerilen bilgi mimarisi

1. **Ana Sayfa**: öne çıkan kişisel devam aksiyonu, izleme listesinden “Bir film seç” rastgele önerisi, son izlenenler ve listelere hızlı erişim. Boş hesapta kullanıcıyı keşfe götüren belirgin başlangıç.
2. **Keşfet**: sürekli görünür arama; trendler, türler ve yıl gibi kolay giriş noktaları; sonuçlarda hızlı liste/izlendi aksiyonları. Mevcut TMDB veri kapsamı dışındaki filtreler vaat edilmez.
3. **Listeler**: İzleme listem ve İzlediklerim ayrımı en üstte; özel listeler bunlardan ayrı gruplanır. Görünürlük ve düzenleme durumu açıkça belirtilir.
4. **Profil**: izleme istatistikleri, son izlenenler, arkadaşlar, paylaşım ve dil/bölge tercihleri.
5. **Film detay**: üst bölümde poster, ad, yıl, süre, TMDB puanı; ilk ekran içinde “Listeye ekle” ve “İzledim” ana aksiyonları. Altında kısa özet, türler, oyuncular, fragman ve mevcutsa izleme sağlayıcıları. Kişisel puan/yorum ve izleme tarihçesi ikincil bölümde.
6. **Mesajlar**: mevcut özellik yakında ekranı olarak kaldığı için ana navigasyonda merkezî yer işgal etmemeli. Gerçek mesajlaşma etkinleştirildiğinde bildirim işaretiyle erişilebilir bir birincil konuma alınır.

Navigasyon mobilde dört sabit hedef önerir: **Ana Sayfa, Keşfet, Listeler, Profil**. Mesajlar üst çubukta gelen kutusu düğmesi olur. Geniş ekranda aynı hedefler sol menüde; global arama her sayfada üst çubukta bulunur.

## Temel kullanıcı akışları

### İlk kullanım

Girişten sonra boş durum; kısa açıklama, büyük “Film keşfet” çağrısı ve arama alanı. Kullanıcı bir film eklediğinde ana sayfa kişisel listeyi ve sonraki öneriyi göstermeye başlar.

### Belirli bir filmi bulma

Her ekrandan arama → anında anlaşılır sonuç listesi → sonuç üzerinde kaydet/izlendi → snackbar veya durum metni ile onay → film ayrıntısına devam edebilme.

### Ne izleyeceğine karar verme

Ana sayfada “İzleme listemden seç” butonu rastgele filmi ve seçim sebebini gösterir; kullanıcı ayrıntıyı açabilir veya başka film seçebilir. Ayrı keşfet ekranında trend, tür ve arama yolları sağlanır. Sistem kişiselleştirilmiş öneri üretiyormuş gibi davranmaz.

### İzleme kaydı

Film detayında “İzledim” ana aksiyonu. Geçmiş tarih, kişisel puan ve yorum detay ekranında açıkça etiketli ikincil alanlardır. Kaydetme ve izleme durumu güncellendikten sonra net onay verilir; ağ hatasında kullanıcı girdisi korunur ve tekrar deneme sunulur.

## Ekran önceliği ve aşamalar

### Aşama 1 — Tasarım sistemi ve uygulama kabuğu

- Renk, tipografi, boşluk, radius, elevation ve focus token'larını belirle.
- Button, input, poster kartı, durum etiketi, boş/yükleniyor/hata ekranlarını ortaklaştır.
- `BottomNav` içindeki masaüstü ve mobil davranışı dört ana hedef + global arama düzenine çevir.

### Aşama 2 — Ana görevler

- `/` ana sayfayı “bugün ne izleyeyim?” ve kişisel kütüphane odağıyla yenile.
- `/search` ekranını arama ve gezinme için aynı hiyerarşide düzenle.
- `/movie/[id]` detayını hızlı izleme aksiyonları ve taranabilir içerik sırasına göre yenile.

### Aşama 3 — Kütüphane ve hesap

- `/lists`, `/lists/[id]`, `/profile` ve `/u/[id]` sayfalarını aynı bileşen sistemiyle yeniden kur.
- Liste oluşturma, gizlilik, arkadaşlık ve paylaşım geri bildirimlerini tutarlı hale getir.

### Aşama 4 — Tamamlama

- Login, mesajların yakında ekranı ve cache yenileme operasyon ekranını yeni kabuğa uyarla.
- Türkçe ve İngilizce metinlerin uzunluğunu, boş durumları, yavaş ağ ve görseli olmayan filmleri gözden geçir.
- Klavye, ekran okuyucu, mobil hedef ölçüsü, kontrast ve dar ekran davranışını kontrol et.

## Başarı ölçütleri

- Yeni kullanıcı girişten sonra ilk filmi yardımsız şekilde bulup listeye ekleyebilir.
- Kaydetme, izlendi işaretleme, geçmiş ve liste gizliliği aksiyonları birbirine karışmaz.
- Arama, keşif ve kişisel kütüphaneye her sayfadan kolayca ulaşılır.
- Boş, yükleniyor, başarılı ve hata durumları her veri ağırlıklı ekranda tasarlanır.
- Mobil ana aksiyonlar rahat dokunulur; klavye odağı görünür; temel içerik renk olmadan da anlaşılır.

## Uygulama notu

İlk uygulama turunda ortak görsel sistem, masaüstü/telefon navigasyonu, ana sayfa, türle film keşfi, liste yönetimi, film detay aksiyonları ve profil sayfaları bu plana göre yenilendi. Kaynak kodda Next.js 16.4.2'nin kurulu kılavuzları esas alındı. Bu plan, kalan görsel tutarlılık ve sonraki iyileştirmeler için referans olarak tutulur.
