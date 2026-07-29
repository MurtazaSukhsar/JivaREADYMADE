// Every piece of the storefront's own wording, in the three languages the
// popup offers. Deliberately NOT in here: anything that comes out of the
// Google Sheet — product names, descriptions, sizes and colours all show
// exactly as they were typed, in every language.
//
// Adding a string: add it to `en` first. TypeScript then refuses to compile
// until `hi` and `gu` have the same key, so a half-translated build is not
// possible.

export type Language = "en" | "hi" | "gu";

export const LANGUAGES: { code: Language; native: string; short: string }[] = [
  { code: "en", native: "English", short: "EN" },
  { code: "hi", native: "हिन्दी", short: "हिं" },
  { code: "gu", native: "ગુજરાતી", short: "ગુ" },
];

export const LANGUAGE_COOKIE = "lang";
// A year: long enough that a returning customer never sees the popup twice.
export const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLanguage(value: unknown): value is Language {
  return value === "en" || value === "hi" || value === "gu";
}

const en = {
  // --- header / footer ---
  "nav.shop": "Shop",
  "nav.bag": "Bag",
  "nav.toggleMenu": "Toggle menu",
  "nav.language": "Language",
  "footer.tagline": "Menswear built for how you actually move.",
  "footer.shopCollection": "Shop the collection →",
  "footer.stayInLoop": "Stay in the loop",
  "footer.emailPlaceholder": "Email address",
  "footer.join": "Join",
  "footer.manageCatalog": "Manage catalog",
  "marquee.strip": "Free shipping over {currency} {amount} — 14 day returns — Made to last —",

  // --- home ---
  "home.collection": "Collection",
  "home.newArrivals": "New arrivals — {season}",
  "home.heroTitle": "Menswear built for how you actually move.",
  "home.shopEdit": "Shop the edit",
  "home.newestIn": "Newest In",
  "home.nothingYet": "Nothing here yet",
  "home.viewAll": "View all →",
  "home.emptyHelp":
    "Add your first product from the catalog manager and it'll show up right here.",
  "home.pullQuote": "Cut for wear, not for the rack.",
  "home.browseCatalog": "Browse the full catalog",

  // --- shop ---
  "shop.title": "The Collection",
  "shop.pieces_one": "{season} — {count} piece",
  "shop.pieces_other": "{season} — {count} pieces",
  "shop.empty":
    "Nothing in the catalog yet — add a product from the catalog manager and it will show up here automatically.",

  // --- product ---
  "product.details": "Details",
  "product.styleCode": "Style code {code}",
  "product.partOfCollection": "Part of the {season} collection",
  "product.shipsIn": "Ships in 3–5 business days",
  "product.alsoLike": "You may also like",
  "product.size": "Size",
  "product.color": "Color",
  "product.addToBag": "Add to bag",
  "product.added": "Added",
  "product.addedNote":
    "The price here is for reference — checkout always confirms the current price from the catalog.",
  "product.viewBag": "View bag →",
  "product.showImage": "Show image {n}",

  // --- cart ---
  "cart.emptyTitle": "Your bag is empty",
  "cart.emptyBody": "Nothing here yet — go find something worth carrying around.",
  "cart.browse": "Browse the catalog",
  "cart.title": "Your Bag",
  "cart.remove": "Remove",
  "cart.decrease": "Decrease quantity",
  "cart.increase": "Increase quantity",
  "cart.subtotal": "Estimated subtotal",
  "cart.subtotalNote": "Final total is confirmed at checkout from current catalog prices.",
  "cart.checkout": "Checkout",

  // --- checkout ---
  "checkout.title": "Checkout",
  "checkout.emptyBody": "Add something to your bag before checking out.",
  "checkout.deliveryDetails": "Delivery details",
  "checkout.whatsappNote":
    "We use your phone number to send a WhatsApp update when the parcel ships.",
  "checkout.name": "Full name",
  "checkout.phone": "WhatsApp number",
  "checkout.email": "Email",
  "checkout.address": "Address",
  "checkout.city": "City",
  "checkout.pincode": "Pincode",
  "checkout.addressPlaceholder": "Flat / house no., building, street, area",
  "checkout.orderSummary": "Order summary",
  "checkout.estimateNote":
    "This total is an estimate — Razorpay charges the amount our server confirms against the current catalog, not this number.",
  "checkout.pay": "Pay with Razorpay",
  "checkout.preparing": "Preparing order…",
  "checkout.waiting": "Waiting for payment…",
  "checkout.confirming": "Confirming payment…",
  "checkout.cod": "Cash on Delivery",
  "checkout.placingOrder": "Placing order…",
  "checkout.orderDescription_one": "Order · {count} item",
  "checkout.orderDescription_other": "Order · {count} items",

  // --- validation / errors ---
  "err.name": "Enter your full name",
  "err.phone": "Enter a valid phone number",
  "err.email": "Enter a valid email",
  "err.address": "Enter your full address",
  "err.city": "Enter your city",
  "err.pincode": "Enter a valid pincode",
  "err.checkFields": "Check the highlighted fields before paying.",
  "err.checkFieldsOrder": "Check the highlighted fields before ordering.",
  "err.couldNotStart": "Could not start checkout.",
  "err.scriptNotReady": "Payment script hasn't loaded yet — try again in a moment.",
  "err.notVerified": "Payment could not be verified.",
  "err.unconfirmed":
    "Payment went through, but we couldn't confirm it. Contact support with your payment ID.",
  "err.paymentFailed": "Payment failed or was cancelled. No charge was made.",
  "err.server": "Could not reach the server. Try again.",

  // --- confirmation ---
  "confirm.paid": "Payment confirmed",
  "confirm.thankYou": "Thank you",
  "confirm.orderConfirmed": "Order {id} is confirmed.",
  "confirm.orderStatus": "Order {status}",
  "confirm.waitingTitle": "Still waiting on payment",
  "confirm.waitingBody":
    "This order hasn't been confirmed as paid yet. If you completed a payment and see this, it will update automatically within a minute.",
  "confirm.deliveringTo": "Delivering to",
  "confirm.whatsappNote": "We'll message {phone} on WhatsApp when it ships.",
  "confirm.codTitle": "Order Confirmed",
  "confirm.codBody": "Order {id} is confirmed. Please pay with cash when your package arrives.",
  "confirm.totalPaid": "Total paid",
  "confirm.totalToPay": "Total to pay",
  "confirm.continue": "Continue shopping",

  // --- shared ---
  "common.qty": "Qty {n}",
  "common.total": "Total",
  "status.created": "created",
  "status.paid": "paid",
  "status.failed": "failed",
  "status.cod_pending": "cash on delivery",
};

export type TranslationKey = keyof typeof en;
type Dictionary = Record<TranslationKey, string>;

const hi: Dictionary = {
  "nav.shop": "शॉप",
  "nav.bag": "बैग",
  "nav.toggleMenu": "मेन्यू खोलें या बंद करें",
  "nav.language": "भाषा",
  "footer.tagline": "पुरुषों के कपड़े, जो आपकी असल रफ़्तार के लिए बने हैं।",
  "footer.shopCollection": "कलेक्शन देखें →",
  "footer.stayInLoop": "अपडेट पाते रहें",
  "footer.emailPlaceholder": "ईमेल पता",
  "footer.join": "जुड़ें",
  "footer.manageCatalog": "कैटलॉग प्रबंधन",
  "marquee.strip":
    "{currency} {amount} से ऊपर मुफ़्त शिपिंग — 14 दिन में वापसी — टिकाऊ बनावट —",

  "home.collection": "कलेक्शन",
  "home.newArrivals": "नया आया — {season}",
  "home.heroTitle": "पुरुषों के कपड़े, जो आपकी असल रफ़्तार के लिए बने हैं।",
  "home.shopEdit": "कलेक्शन देखें",
  "home.newestIn": "सबसे नया",
  "home.nothingYet": "अभी यहाँ कुछ नहीं है",
  "home.viewAll": "सभी देखें →",
  "home.emptyHelp":
    "कैटलॉग मैनेजर से अपना पहला प्रोडक्ट जोड़ें — वह सीधे यहीं दिखने लगेगा।",
  "home.pullQuote": "पहनने के लिए बना, दिखावे के लिए नहीं।",
  "home.browseCatalog": "पूरा कैटलॉग देखें",

  "shop.title": "कलेक्शन",
  "shop.pieces_one": "{season} — {count} पीस",
  "shop.pieces_other": "{season} — {count} पीस",
  "shop.empty":
    "कैटलॉग में अभी कुछ नहीं है — कैटलॉग मैनेजर से प्रोडक्ट जोड़ें, वह अपने आप यहाँ दिखने लगेगा।",

  "product.details": "विवरण",
  "product.styleCode": "स्टाइल कोड {code}",
  "product.partOfCollection": "{season} कलेक्शन का हिस्सा",
  "product.shipsIn": "3–5 कार्यदिवस में भेजा जाएगा",
  "product.alsoLike": "यह भी पसंद आ सकता है",
  "product.size": "साइज़",
  "product.color": "रंग",
  "product.addToBag": "बैग में डालें",
  "product.added": "जुड़ गया",
  "product.addedNote":
    "यहाँ दिखी कीमत सिर्फ़ संदर्भ के लिए है — चेकआउट हमेशा कैटलॉग की मौजूदा कीमत से पक्की करता है।",
  "product.viewBag": "बैग देखें →",
  "product.showImage": "इमेज {n} दिखाएँ",

  "cart.emptyTitle": "आपका बैग खाली है",
  "cart.emptyBody": "अभी कुछ नहीं है — कुछ ऐसा चुनिए जो साथ ले जाने लायक हो।",
  "cart.browse": "कैटलॉग देखें",
  "cart.title": "आपका बैग",
  "cart.remove": "हटाएँ",
  "cart.decrease": "मात्रा घटाएँ",
  "cart.increase": "मात्रा बढ़ाएँ",
  "cart.subtotal": "अनुमानित उप-योग",
  "cart.subtotalNote": "अंतिम राशि चेकआउट पर मौजूदा कैटलॉग कीमतों से तय होगी।",
  "cart.checkout": "चेकआउट",

  "checkout.title": "चेकआउट",
  "checkout.emptyBody": "चेकआउट से पहले बैग में कुछ जोड़ें।",
  "checkout.deliveryDetails": "डिलीवरी विवरण",
  "checkout.whatsappNote":
    "पार्सल भेजते समय व्हाट्सऐप पर अपडेट भेजने के लिए हम आपका नंबर इस्तेमाल करते हैं।",
  "checkout.name": "पूरा नाम",
  "checkout.phone": "व्हाट्सऐप नंबर",
  "checkout.email": "ईमेल",
  "checkout.address": "पता",
  "checkout.city": "शहर",
  "checkout.pincode": "पिनकोड",
  "checkout.addressPlaceholder": "फ़्लैट / मकान नं., बिल्डिंग, गली, इलाका",
  "checkout.orderSummary": "ऑर्डर सारांश",
  "checkout.estimateNote":
    "यह राशि अनुमानित है — Razorpay वही रकम लेगा जो हमारा सर्वर मौजूदा कैटलॉग से पक्की करेगा, यह संख्या नहीं।",
  "checkout.pay": "Razorpay से भुगतान करें",
  "checkout.preparing": "ऑर्डर तैयार हो रहा है…",
  "checkout.waiting": "भुगतान की प्रतीक्षा…",
  "checkout.confirming": "भुगतान की पुष्टि हो रही है…",
  "checkout.cod": "डिलीवरी पर नकद भुगतान",
  "checkout.placingOrder": "ऑर्डर दर्ज हो रहा है…",
  "checkout.orderDescription_one": "ऑर्डर · {count} वस्तु",
  "checkout.orderDescription_other": "ऑर्डर · {count} वस्तुएँ",

  "err.name": "अपना पूरा नाम भरें",
  "err.phone": "सही फ़ोन नंबर भरें",
  "err.email": "सही ईमेल भरें",
  "err.address": "अपना पूरा पता भरें",
  "err.city": "अपना शहर भरें",
  "err.pincode": "सही पिनकोड भरें",
  "err.checkFields": "भुगतान से पहले चिह्नित जगहें जाँच लें।",
  "err.checkFieldsOrder": "ऑर्डर से पहले चिह्नित जगहें जाँच लें।",
  "err.couldNotStart": "चेकआउट शुरू नहीं हो सका।",
  "err.scriptNotReady": "भुगतान स्क्रिप्ट अभी लोड नहीं हुई — थोड़ी देर में फिर कोशिश करें।",
  "err.notVerified": "भुगतान की पुष्टि नहीं हो सकी।",
  "err.unconfirmed":
    "भुगतान हो गया, पर हम उसकी पुष्टि नहीं कर सके। अपना पेमेंट आईडी लेकर सपोर्ट से संपर्क करें।",
  "err.paymentFailed": "भुगतान विफल रहा या रद्द हुआ। कोई राशि नहीं कटी।",
  "err.server": "सर्वर से संपर्क नहीं हो सका। फिर कोशिश करें।",

  "confirm.paid": "भुगतान की पुष्टि हुई",
  "confirm.thankYou": "धन्यवाद",
  "confirm.orderConfirmed": "ऑर्डर {id} पक्का हो गया।",
  "confirm.orderStatus": "ऑर्डर {status}",
  "confirm.waitingTitle": "भुगतान का इंतज़ार है",
  "confirm.waitingBody":
    "यह ऑर्डर अभी भुगतान के रूप में पक्का नहीं हुआ है। अगर आपने भुगतान कर दिया है और यह दिख रहा है, तो एक मिनट में यह अपने आप अपडेट हो जाएगा।",
  "confirm.deliveringTo": "यहाँ डिलीवरी होगी",
  "confirm.whatsappNote": "भेजते समय हम {phone} पर व्हाट्सऐप संदेश भेजेंगे।",
  "confirm.codTitle": "ऑर्डर पक्का हो गया",
  "confirm.codBody": "ऑर्डर {id} पक्का हो गया। पार्सल पहुँचने पर नकद भुगतान करें।",
  "confirm.totalPaid": "कुल भुगतान",
  "confirm.totalToPay": "देय राशि",
  "confirm.continue": "खरीदारी जारी रखें",

  "common.qty": "मात्रा {n}",
  "common.total": "कुल",
  "status.created": "बना हुआ",
  "status.paid": "भुगतान हुआ",
  "status.failed": "विफल",
  "status.cod_pending": "डिलीवरी पर नकद",
};

const gu: Dictionary = {
  "nav.shop": "શોપ",
  "nav.bag": "બેગ",
  "nav.toggleMenu": "મેનુ ખોલો કે બંધ કરો",
  "nav.language": "ભાષા",
  "footer.tagline": "પુરુષોનાં કપડાં, જે તમારી ખરી ગતિ માટે બન્યાં છે.",
  "footer.shopCollection": "કલેક્શન જુઓ →",
  "footer.stayInLoop": "અપડેટ મેળવતા રહો",
  "footer.emailPlaceholder": "ઈમેલ સરનામું",
  "footer.join": "જોડાઓ",
  "footer.manageCatalog": "કૅટલોગ સંચાલન",
  "marquee.strip":
    "{currency} {amount} થી વધુ પર મફત શિપિંગ — 14 દિવસમાં પરત — ટકાઉ બનાવટ —",

  "home.collection": "કલેક્શન",
  "home.newArrivals": "નવું આવ્યું — {season}",
  "home.heroTitle": "પુરુષોનાં કપડાં, જે તમારી ખરી ગતિ માટે બન્યાં છે.",
  "home.shopEdit": "કલેક્શન જુઓ",
  "home.newestIn": "સૌથી નવું",
  "home.nothingYet": "હજી અહીં કંઈ નથી",
  "home.viewAll": "બધું જુઓ →",
  "home.emptyHelp":
    "કૅટલોગ મેનેજરમાંથી તમારું પહેલું પ્રોડક્ટ ઉમેરો — તે સીધું અહીં જ દેખાશે.",
  "home.pullQuote": "પહેરવા માટે બનેલું, દેખાડા માટે નહીં.",
  "home.browseCatalog": "આખું કૅટલોગ જુઓ",

  "shop.title": "કલેક્શન",
  "shop.pieces_one": "{season} — {count} પીસ",
  "shop.pieces_other": "{season} — {count} પીસ",
  "shop.empty":
    "કૅટલોગમાં હજી કંઈ નથી — કૅટલોગ મેનેજરમાંથી પ્રોડક્ટ ઉમેરો, તે આપોઆપ અહીં દેખાશે.",

  "product.details": "વિગતો",
  "product.styleCode": "સ્ટાઇલ કોડ {code}",
  "product.partOfCollection": "{season} કલેક્શનનો ભાગ",
  "product.shipsIn": "3–5 કામકાજના દિવસમાં મોકલાશે",
  "product.alsoLike": "આ પણ ગમી શકે",
  "product.size": "સાઇઝ",
  "product.color": "રંગ",
  "product.addToBag": "બેગમાં ઉમેરો",
  "product.added": "ઉમેરાયું",
  "product.addedNote":
    "અહીં દેખાતી કિંમત ફક્ત સંદર્ભ માટે છે — ચેકઆઉટ હંમેશાં કૅટલોગની હાલની કિંમતથી નક્કી કરે છે.",
  "product.viewBag": "બેગ જુઓ →",
  "product.showImage": "ઇમેજ {n} બતાવો",

  "cart.emptyTitle": "તમારી બેગ ખાલી છે",
  "cart.emptyBody": "હજી કંઈ નથી — કંઈક એવું પસંદ કરો જે સાથે લઈ જવા જેવું હોય.",
  "cart.browse": "કૅટલોગ જુઓ",
  "cart.title": "તમારી બેગ",
  "cart.remove": "દૂર કરો",
  "cart.decrease": "જથ્થો ઘટાડો",
  "cart.increase": "જથ્થો વધારો",
  "cart.subtotal": "અંદાજિત પેટા-સરવાળો",
  "cart.subtotalNote": "આખરી રકમ ચેકઆઉટ વખતે હાલની કૅટલોગ કિંમતોથી નક્કી થશે.",
  "cart.checkout": "ચેકઆઉટ",

  "checkout.title": "ચેકઆઉટ",
  "checkout.emptyBody": "ચેકઆઉટ પહેલાં બેગમાં કંઈક ઉમેરો.",
  "checkout.deliveryDetails": "ડિલિવરી વિગતો",
  "checkout.whatsappNote":
    "પાર્સલ મોકલતી વખતે વૉટ્સએપ પર અપડેટ મોકલવા માટે અમે તમારો નંબર વાપરીએ છીએ.",
  "checkout.name": "પૂરું નામ",
  "checkout.phone": "વૉટ્સએપ નંબર",
  "checkout.email": "ઈમેલ",
  "checkout.address": "સરનામું",
  "checkout.city": "શહેર",
  "checkout.pincode": "પિનકોડ",
  "checkout.addressPlaceholder": "ફ્લેટ / મકાન નં., બિલ્ડિંગ, શેરી, વિસ્તાર",
  "checkout.orderSummary": "ઓર્ડર સારાંશ",
  "checkout.estimateNote":
    "આ રકમ અંદાજિત છે — Razorpay એ જ રકમ લેશે જે અમારું સર્વર હાલના કૅટલોગથી નક્કી કરશે, આ સંખ્યા નહીં.",
  "checkout.pay": "Razorpay થી ચુકવણી કરો",
  "checkout.preparing": "ઓર્ડર તૈયાર થઈ રહ્યો છે…",
  "checkout.waiting": "ચુકવણીની રાહ…",
  "checkout.confirming": "ચુકવણીની ખાતરી થઈ રહી છે…",
  "checkout.cod": "ડિલિવરી વખતે રોકડ ચુકવણી",
  "checkout.placingOrder": "ઓર્ડર નોંધાઈ રહ્યો છે…",
  "checkout.orderDescription_one": "ઓર્ડર · {count} વસ્તુ",
  "checkout.orderDescription_other": "ઓર્ડર · {count} વસ્તુઓ",

  "err.name": "તમારું પૂરું નામ ભરો",
  "err.phone": "સાચો ફોન નંબર ભરો",
  "err.email": "સાચો ઈમેલ ભરો",
  "err.address": "તમારું પૂરું સરનામું ભરો",
  "err.city": "તમારું શહેર ભરો",
  "err.pincode": "સાચો પિનકોડ ભરો",
  "err.checkFields": "ચુકવણી પહેલાં ચિહ્નિત ખાનાં તપાસી લો.",
  "err.checkFieldsOrder": "ઓર્ડર પહેલાં ચિહ્નિત ખાનાં તપાસી લો.",
  "err.couldNotStart": "ચેકઆઉટ શરૂ ન થઈ શક્યું.",
  "err.scriptNotReady": "ચુકવણી સ્ક્રિપ્ટ હજી લોડ થઈ નથી — થોડી વારે ફરી પ્રયાસ કરો.",
  "err.notVerified": "ચુકવણીની ખાતરી ન થઈ શકી.",
  "err.unconfirmed":
    "ચુકવણી થઈ ગઈ, પણ અમે તેની ખાતરી ન કરી શક્યા. તમારો પેમેન્ટ આઈડી લઈને સપોર્ટનો સંપર્ક કરો.",
  "err.paymentFailed": "ચુકવણી નિષ્ફળ ગઈ કે રદ થઈ. કોઈ રકમ કપાઈ નથી.",
  "err.server": "સર્વર સાથે સંપર્ક ન થઈ શક્યો. ફરી પ્રયાસ કરો.",

  "confirm.paid": "ચુકવણીની ખાતરી થઈ",
  "confirm.thankYou": "આભાર",
  "confirm.orderConfirmed": "ઓર્ડર {id} નક્કી થઈ ગયો.",
  "confirm.orderStatus": "ઓર્ડર {status}",
  "confirm.waitingTitle": "ચુકવણીની રાહ છે",
  "confirm.waitingBody":
    "આ ઓર્ડર હજી ચુકવાયેલો તરીકે નક્કી થયો નથી. જો તમે ચુકવણી કરી દીધી હોય અને આ દેખાતું હોય, તો એક મિનિટમાં તે આપોઆપ અપડેટ થઈ જશે.",
  "confirm.deliveringTo": "અહીં ડિલિવરી થશે",
  "confirm.whatsappNote": "મોકલતી વખતે અમે {phone} પર વૉટ્સએપ સંદેશ મોકલીશું.",
  "confirm.codTitle": "ઓર્ડર નક્કી થઈ ગયો",
  "confirm.codBody": "ઓર્ડર {id} નક્કી થઈ ગયો. પાર્સલ પહોંચે ત્યારે રોકડ ચુકવણી કરો.",
  "confirm.totalPaid": "કુલ ચુકવણી",
  "confirm.totalToPay": "ચૂકવવાની રકમ",
  "confirm.continue": "ખરીદી ચાલુ રાખો",

  "common.qty": "જથ્થો {n}",
  "common.total": "કુલ",
  "status.created": "બનેલો",
  "status.paid": "ચુકવાયેલો",
  "status.failed": "નિષ્ફળ",
  "status.cod_pending": "ડિલિવરી પર રોકડ",
};

const dictionaries: Record<Language, Dictionary> = { en, hi, gu };

export type Translate = (
  key: TranslationKey,
  vars?: Record<string, string | number>
) => string;

// Returns the `t()` used everywhere. Missing keys can't happen (the types
// enforce it), but an unknown key at runtime falls back to English and then
// to the key itself rather than rendering "undefined" at a customer.
export function getTranslator(language: Language): Translate {
  const dict = dictionaries[language] ?? en;

  return (key, vars) => {
    let text = dict[key] ?? en[key] ?? key;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.split(`{${name}}`).join(String(value));
      }
    }
    return text;
  };
}

// English is the only one of the three with a singular/plural split, but
// routing every count through here keeps the call sites identical.
export function plural(
  t: Translate,
  base: "shop.pieces" | "checkout.orderDescription",
  count: number,
  vars?: Record<string, string | number>
): string {
  const key = (count === 1 ? `${base}_one` : `${base}_other`) as TranslationKey;
  return t(key, { count, ...vars });
}
