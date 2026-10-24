export const DEFAULT_LANGUAGE = "tr";
export const DEFAULT_REGION = "TR";

export const LANGUAGES = [
  { code: "tr", label: "Türkçe", tmdb: "tr-TR", dayjs: "tr" },
  { code: "en", label: "English", tmdb: "en-US", dayjs: "en" },
];

export const REGIONS = [
  { code: "TR", label: "Türkiye" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "DE", label: "Deutschland" },
];

const messages = {
  tr: {
    nav: { home: "Ana Sayfa", discover: "Keşfet", lists: "Listeler", messages: "Mesajlar", profile: "Profil", search: "Film ara...", main: "Ana navigasyon", sidebar: "Yan menü", openMenu: "Menüyü aç", closeMenu: "Menüyü kapat", openSidebar: "Yan menüyü aç", closeSidebar: "Yan menüyü kapat", mobile: "Mobil navigasyon", unread: "Okunmamış mesaj", homeLink: "Seyir ana sayfa", profileLabel: "Profil", user: "Kullanıcı", logout: "Çıkış Yap" },
    common: { loading: "Yükleniyor...", cancel: "İptal", save: "Kaydet", saved: "Kaydedildi", saving: "Kaydediliyor...", error: "Bir hata oluştu.", back: "Geri Dön", details: "Detaylar", film: "Film", delete: "Sil" },
    settings: { title: "Ayarlar", language: "Dil", region: "Bölge", languageHelp: "Arayüz ve film bilgileri için dil.", regionHelp: "TMDB sonuçları ve izleme platformları bu bölgeye göre gösterilir.", saved: "Tercihler kaydedildi.", error: "Tercihler kaydedilemedi." },
    profile: { watched: "İzlendi", wishlist: "Listede", average: "Ort. Puan", friends: "Arkadaşlarım", addFriend: "+ Arkadaş Ekle", recentlyWatched: "Son İzlenenler", all: "Tümü", share: "Paylaş", logout: "Çıkış", shareTitle: "Seyir", shareText: "Beni Seyir'de arkadaş ekle!", copied: "Profil linkiniz kopyalandı! 🚀", attribution: "Bu uygulama TMDB API'sini kullanmaktadır ancak TMDB tarafından onaylanmamıştır." },
    search: { title: "Film Keşfet", placeholder: "Film ara...", trending: "Günün Trendleri", results: "sonuç", noResults: "Sonuç bulunamadı", tryDifferent: "Farklı bir arama deneyin", watched: "İzlendi", wishlist: "Listende" },
    home: { lucky: "ŞANSLI FİLM", runtime: "dk", archiveRecord: "Arşiv kaydı", film: "Film", details: "Detayları Gör", shuffle: "Şanslı filmi değiştir", emptyWatchlist: "İzleme listeniz boş", wishlist: "Wishlist", watched: "İzlediklerim", emptyTitle: "Bu liste boş", emptyText: "Keşfet bölümünden ilk filmi ekleyebilirsin.", undated: "Tarih Belirtilmemiş", sortAddedDesc: "En Son Eklenen", sortAddedAsc: "En Eski Eklenen", sortWatchedDesc: "En Son İzlenen", sortWatchedAsc: "En Eski İzlenen", sortRatingDesc: "En Yüksek Puan", sortRatingAsc: "En Düşük Puan", sortTitleAsc: "İsme Göre (A→Z)", sortTitleDesc: "İsme Göre (Z→A)" },
    movie: { watchWhere: "Nereden izlenir?", subscription: "Abonelik", free: "Ücretsiz", ads: "Reklamlı", rent: "Kiralama", buy: "Satın alma", noProviders: "Bu bölgede yayın bilgisi bulunamadı.", providersError: "İzleme seçenekleri şu anda yüklenemiyor.", justWatch: "İzleme seçenekleri JustWatch üzerinden sağlanır.", overview: "Özet", cast: "Oyuncular", trailer: "Fragman", notFound: "Film bulunamadı.", runtime: "dk", actionsWatched: "İzledim", watchedAgain: "Tekrar İzledim", pastDate: "Geçmiş Tarih", chooseDate: "Tarih Seç", addWishlist: "İzleme Listesine Ekle", inWishlist: "İzleme Listesinde", moveWishlist: "İzleme Listesine Al", chooseList: "Liste seç", addToList: "Listeye ekle", recommend: "Arkadaşa Öner", noDate: "Ne zaman izledim bilmiyorum", rating: "Değerlendirmeniz", reviewPlaceholder: "Film hakkında kişisel notlarınız veya incelemeniz...", saveNote: "Notu Kaydet", history: "İzleme Geçmişi", removeRecord: "Bu kaydı sil", chooseWatchDate: "İzleme Tarihi Seç", watchedDateQuestion: "Filmi hangi tarihte izlediniz?", missingOverview: "Bu film için özet bulunmamaktadır." },
    archive: { empty: "Arşiv boş", filmArchive: "Film arşivi", posterAlt: "Film posteri" },
    auth: { description: "İzlediğiniz ve izleyeceğiniz filmleri takip edin.", google: "Google ile devam et", privacy: "Verileriniz güvenle saklanır." },
    lists: { eyebrow: "KÜTÜPHANE", title: "Listelerim", namePlaceholder: "Yeni liste adı", create: "Liste oluştur", rename: "Listeyi düzenle", save: "Kaydet", added: "Listeye eklendi", public: "Herkese açık", private: "Gizli", wishlist: "İZLEMEK İSTEDİKLERİM", watched: "İZLEDİKLERİM", custom: "ÖZEL LİSTE", wishlistHelp: "Ana sayfada gösterilir", watchedHelp: "İzlenme günlüğü; ana sayfada gösterilmez", customHelp: "Kendi film listen" },
    comingSoon: { eyebrow: "PERDE ARKASI", title: "Mesajlar yakında", description: "Mesajlaşma alanını daha iyi bir deneyim için hazırlıyoruz. Çok yakında burada buluşacağız.", home: "Ana sayfaya dön" },
    messages: { title: "Sohbetler", subtitle: "Arkadaşlarınla mesajlaş", new: "Yeni", empty: "Henüz sohbet yok", emptyText: "Sağ üstteki \"Yeni\" butonuna basarak arkadaşlarınla konuşmaya başla!", start: "Sohbet Başlat", selectFriend: "Arkadaş listenden seç", searchFriend: "Arkadaş ara...", needFriend: "Sohbet başlatmak için arkadaşın olması gerekiyor.", shareProfile: "Profil Linkini Paylaş", noResults: "Sonuç bulunamadı", started: "Sohbet başlatıldı", online: "çevrimiçi", input: "Mesaj yaz...", send: "Gönder", today: "Bugün", yesterday: "Dün", notFound: "Sohbet bulunamadı", error: "Sohbet başlatılırken bir hata oluştu.", recommendation: "Film Önerisi" },
    publicProfile: { notFound: "Kullanıcı bulunamadı.", watched: "İzlendi", average: "Ort. Puan", watchedMovies: "İzlediği Filmler", wishlist: "Wishlist", empty: "Bu liste boş.", addFriend: "Arkadaş Ekle", removeFriend: "Arkadaşlıktan Çıkar", message: "Mesaj Gönder", back: "Geri Dön" },
    refreshCache: { title: "TMDB Cache Yenileme Aracı", refresh: "Tüm Cache'i Yenile", processing: "İşleniyor...", waiting: "İşlem bekleniyor...", starting: "Başlıyor...", completed: "Tamamlandı!", fetching: "ID {id} için TMDB'den veri çekiliyor...", failed: "HATA: {id} için TMDB isteği başarısız.", success: "BAŞARILI: {title} güncellendi." },
  },
  en: {
    nav: { home: "Home", discover: "Discover", lists: "Lists", messages: "Messages", profile: "Profile", search: "Search films...", main: "Main navigation", sidebar: "Sidebar", openMenu: "Open menu", closeMenu: "Close menu", openSidebar: "Open sidebar", closeSidebar: "Close sidebar", mobile: "Mobile navigation", unread: "Unread message", homeLink: "Seyir home", profileLabel: "Profile", user: "User", logout: "Log out" },
    common: { loading: "Loading...", cancel: "Cancel", save: "Save", saved: "Saved", saving: "Saving...", error: "Something went wrong.", back: "Back", details: "Details", film: "Film", delete: "Delete" },
    settings: { title: "Settings", language: "Language", region: "Region", languageHelp: "Language for the interface and movie details.", regionHelp: "TMDB results and streaming platforms are shown for this region.", saved: "Preferences saved.", error: "Could not save preferences." },
    profile: { watched: "Watched", wishlist: "Watchlist", average: "Avg. rating", friends: "My friends", addFriend: "+ Add friend", recentlyWatched: "Recently watched", all: "All", share: "Share", logout: "Log out", shareTitle: "Seyir", shareText: "Add me as a friend on Seyir!", copied: "Profile link copied! 🚀", attribution: "This application uses the TMDB API but is not endorsed or certified by TMDB." },
    search: { title: "Discover films", placeholder: "Search films...", trending: "Trending today", results: "results", noResults: "No results found", tryDifferent: "Try a different search", watched: "Watched", wishlist: "On your list" },
    home: { lucky: "LUCKY FILM", runtime: "min", archiveRecord: "Archive record", film: "Film", details: "View details", shuffle: "Change lucky film", emptyWatchlist: "Your watchlist is empty", wishlist: "Wishlist", watched: "Watched", emptyTitle: "This list is empty", emptyText: "Add your first film from Discover.", undated: "Date Not Available", sortAddedDesc: "Recently added", sortAddedAsc: "Oldest added", sortWatchedDesc: "Recently watched", sortWatchedAsc: "Oldest watched", sortRatingDesc: "Highest rating", sortRatingAsc: "Lowest rating", sortTitleAsc: "Title (A→Z)", sortTitleDesc: "Title (Z→A)" },
    movie: { watchWhere: "Where to watch", subscription: "Subscription", free: "Free", ads: "With ads", rent: "Rent", buy: "Buy", noProviders: "No streaming information is available in this region.", providersError: "Watch options are unavailable right now.", justWatch: "Watch options provided through JustWatch.", overview: "Overview", cast: "Cast", trailer: "Trailer", notFound: "Movie not found.", runtime: "min", actionsWatched: "I watched it", watchedAgain: "Watched again", pastDate: "Past date", chooseDate: "Choose date", addWishlist: "Add to watchlist", inWishlist: "On your watchlist", moveWishlist: "Move to watchlist", chooseList: "Choose list", addToList: "Add to list", recommend: "Recommend to a friend", noDate: "I don't remember when I watched it", rating: "Your rating", reviewPlaceholder: "Your personal notes or review of the film...", saveNote: "Save note", history: "Watch history", removeRecord: "Remove this record", chooseWatchDate: "Choose watch date", watchedDateQuestion: "When did you watch this film?", missingOverview: "No overview is available for this film." },
    archive: { empty: "Archive is empty", filmArchive: "Film archive", posterAlt: "Movie poster" },
    auth: { description: "Track the films you have watched and want to watch.", google: "Continue with Google", privacy: "Your data is stored securely." },
    lists: { eyebrow: "LIBRARY", title: "My lists", namePlaceholder: "New list name", create: "Create list", rename: "Rename list", save: "Save", added: "Added to list", public: "Public", private: "Private", wishlist: "WATCHLIST", watched: "WATCHED", custom: "CUSTOM LIST", wishlistHelp: "Shown on the home page", watchedHelp: "Watch log; hidden from the home page", customHelp: "Your own movie list" },
    comingSoon: { eyebrow: "BEHIND THE SCREEN", title: "Messages are coming soon", description: "We are preparing the messaging area for a better experience. We will meet you here very soon.", home: "Back to home" },
    messages: { title: "Chats", subtitle: "Message your friends", new: "New", empty: "No chats yet", emptyText: "Press the \"New\" button above to start talking with your friends!", start: "Start a chat", selectFriend: "Choose from your friends", searchFriend: "Search friends...", needFriend: "You need a friend to start a chat.", shareProfile: "Share profile link", noResults: "No results found", started: "Chat started", online: "online", input: "Write a message...", send: "Send", today: "Today", yesterday: "Yesterday", notFound: "Chat not found", error: "Could not start the chat.", recommendation: "Movie recommendation" },
    publicProfile: { notFound: "User not found.", watched: "Watched", average: "Avg. rating", watchedMovies: "Watched films", wishlist: "Wishlist", empty: "This list is empty.", addFriend: "Add friend", removeFriend: "Remove friend", message: "Send message", back: "Back" },
    refreshCache: { title: "TMDB Cache Refresh Tool", refresh: "Refresh all cache", processing: "Processing...", waiting: "Waiting...", starting: "Starting...", completed: "Completed!", fetching: "Fetching data from TMDB for ID {id}...", failed: "ERROR: TMDB request failed for {id}.", success: "SUCCESS: {title} updated." },
  },
};

export function normalizeLanguage(value) { return LANGUAGES.some((language) => language.code === value) ? value : DEFAULT_LANGUAGE; }
export function normalizeRegion(value) { return REGIONS.some((region) => region.code === value) ? value : DEFAULT_REGION; }
export function getLanguageConfig(language) { return LANGUAGES.find((item) => item.code === normalizeLanguage(language)) || LANGUAGES[0]; }
export function getRegionLabel(region, language = DEFAULT_LANGUAGE) {
  const normalized = normalizeRegion(region);
  if (language === "tr" && normalized === "US") return "Amerika Birleşik Devletleri";
  if (language === "tr" && normalized === "GB") return "Birleşik Krallık";
  if (language === "tr" && normalized === "DE") return "Almanya";
  return REGIONS.find((item) => item.code === normalized)?.label || REGIONS[0].label;
}
export function translate(language, key, values = {}) {
  const normalized = normalizeLanguage(language);
  const value = key.split(".").reduce((result, part) => result?.[part], messages[normalized]) ?? key.split(".").reduce((result, part) => result?.[part], messages[DEFAULT_LANGUAGE]) ?? key;
  return typeof value === "string" ? value.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? `{${name}}`) : value;
}
