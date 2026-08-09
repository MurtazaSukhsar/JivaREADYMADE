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
  "product.shipsIn": "Will be delivered in 3–5 days",
  "product.alsoLike": "You may also like",
  "product.size": "Size",
  "product.color": "Color",
  "product.addToBag": "Add to bag",
  "product.added": "Added",
  "product.addedNote":
    "The price here is for reference — checkout always confirms the current price from the catalog.",
  "product.viewBag": "View bag →",
  "product.showImage": "Show image {n}",
  "product.selectSizeError": "Please select a size",
  "product.buyNow": "Buy Now",

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
  "checkout.state": "District / State",
  "checkout.pincode": "Pincode",
  "checkout.addressPlaceholder": "Flat / house no., building, street, area",
  "checkout.orderSummary": "Order summary",
  "checkout.estimateNote":
    "This total is an estimate — the amount in your payment app is the one our server confirms against the current catalog, not this number.",
  "checkout.pay": "Pay by UPI",
  "checkout.preparing": "Preparing order…",
  "checkout.waiting": "Waiting for payment…",
  "checkout.confirming": "Confirming payment…",
  "checkout.cod": "Cash on Delivery",
  "checkout.cod.terms": "COD Terms (Cash on Delivery)",
  "checkout.cod.dueOnDelivery": "Due on Delivery",
  "checkout.cod.advanceNote": "Note: Cash on Delivery orders require a Rs 100 advance payment paid online via Razorpay to confirm the order. The remaining balance is paid on delivery.",
  "checkout.paymentMethod": "Payment Method",
  "checkout.method.online": "Pay Online",
  "checkout.method.onlineSub": "Pay full amount securely via Razorpay",
  "checkout.method.upi": "UPI / GPay",
  "checkout.method.upiSub": "Scan or tap — amount fills in automatically",
  "checkout.method.cod": "Cash on Delivery",
  "checkout.method.codSub": "Pay Rs 100 advance, rest on delivery",
  "checkout.placingOrder": "Placing order…",
  "checkout.orderDescription_one": "Order · {count} item",
  "checkout.orderDescription_other": "Order · {count} items",

  // --- pay by UPI QR ---
  "checkout.upi.title": "Pay by UPI",
  "checkout.upi.amount": "Amount to pay",
  "checkout.upi.amountNote":
    "This amount is already filled in for you — you won't need to type it.",
  "checkout.upi.openApp": "Pay in one tap",
  "checkout.upi.didntWork": "Didn’t work? Pay by scanning instead",
  "checkout.upi.hideQr": "Back to one-tap payment",
  "checkout.upi.otherApp": "Any UPI app",
  "checkout.upi.scan": "Pay by scanning",
  "checkout.upi.saveQr": "Save QR image",
  "checkout.upi.mobileStep1": "1. Tap “Save QR image” below to save it to your phone.",
  "checkout.upi.mobileStep2":
    "2. Open Google Pay, PhonePe or Paytm, tap Scan, then the gallery icon.",
  "checkout.upi.mobileStep3": "3. Pick the saved image — the amount is already filled in.",
  "checkout.upi.qrAlt": "UPI QR code with the payment amount filled in",
  "checkout.upi.copy": "Copy",
  "checkout.upi.copied": "Copied",
  "checkout.upi.desktopStep1": "1. Open Google Pay, PhonePe, Paytm or any UPI app on your phone.",
  "checkout.upi.desktopStep2": "2. Tap the scan button and point it at the code above.",
  "checkout.upi.desktopStep3": "3. The amount is already filled in — just confirm the payment.",
  "checkout.upi.afterPaying": "After you've paid",
  "checkout.upi.refHelp":
    "If your payment app shows a reference number (also called UPI transaction ID or UTR), enter it below — it helps us find your payment faster. You can leave it blank.",
  "checkout.upi.refLabel": "UPI reference number",
  "checkout.upi.refOptional": "(optional)",
  "checkout.upi.submit": "I've paid — place my order",
  "checkout.upi.submitting": "Placing order…",
  "checkout.upi.cancel": "Back to payment options",
  "checkout.upi.verifyNote":
    "We check the payment against our account before dispatch. You'll get a WhatsApp message once it's confirmed.",

  // --- the dedicated payment page (/pay/[id]) ---
  "pay.payingTo": "Paying to",
  "pay.orderRef": "Order",
  "pay.delivery": "Delivery",
  "pay.cancel": "Cancel and go back",

  // --- validation / errors ---
  "err.name": "Enter your full name",
  "err.phone": "Enter a valid phone number",
  "err.email": "Enter a valid email",
  "err.address": "Enter your full address",
  "err.city": "Enter your city",
  "err.state": "Enter your district or state",
  "err.pincode": "Enter a valid pincode",
  "err.upiRef":
    "Enter the reference number from your payment app — letters and digits only.",
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
  "confirm.upiTitle": "Order received",
  "confirm.upiBody":
    "Order {id} is with us. We're checking your UPI payment against our account — you'll get a WhatsApp message the moment it's confirmed, usually within a few hours.",
  "confirm.upiRef": "Your reference",
  "confirm.upiPending": "Payment being checked",
  "confirm.totalPaid": "Total paid",
  "confirm.totalToPay": "Total to pay",
  "confirm.continue": "Continue shopping",
  "confirm.cod.breakdown": "COD Payment Breakdown",
  "confirm.cod.price": "Price",
  "confirm.cod.courier": "Courier Charge",
  "confirm.cod.total": "Total",
  "confirm.cod.advance": "Advance Payment",
  "confirm.cod.deliveryPay": "Delivery Time Payment",
  "confirm.cod.advanceNote": "The Rs 100 advance payment was successfully paid online via Razorpay. The remaining balance of {due} will be collected in cash on delivery.",

  // --- shared ---
  "common.qty": "Qty {n}",
  "common.total": "Total",
  "status.created": "created",
  "status.paid": "paid",
  "status.failed": "failed",
  "status.cod_pending": "cash on delivery",
  "status.upi_pending": "payment being checked",
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
  "product.shipsIn": "3–5 दिनों में डिलीवरी होगी",
  "product.alsoLike": "यह भी पसंद आ सकता है",
  "product.size": "साइज़",
  "product.color": "रंग",
  "product.addToBag": "बैग में डालें",
  "product.added": "जुड़ गया",
  "product.addedNote":
    "यहाँ दिखी कीमत सिर्फ़ संदर्भ के लिए है — चेकआउट हमेशा कैटलॉग की मौजूदा कीमत से पक्की करता है।",
  "product.viewBag": "बैग देखें →",
  "product.showImage": "इमेज {n} दिखाएँ",
  "product.selectSizeError": "कृपया आकार (साइज़) चुनें",
  "product.buyNow": "अभी खरीदें",

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
  "checkout.state": "जिला / राज्य",
  "checkout.pincode": "पिनकोड",
  "checkout.addressPlaceholder": "फ़्लैट / मकान नं., बिल्डिंग, गली, इलाका",
  "checkout.orderSummary": "ऑर्डर सारांश",
  "checkout.estimateNote":
    "यह राशि अनुमानित है — आपके पेमेंट ऐप में जो रकम दिखेगी वही हमारा सर्वर मौजूदा कैटलॉग से पक्की करेगा, यह संख्या नहीं।",
  "checkout.pay": "UPI से भुगतान करें",
  "checkout.preparing": "ऑर्डर तैयार हो रहा है…",
  "checkout.waiting": "भुगतान की प्रतीक्षा…",
  "checkout.confirming": "भुगतान की पुष्टि हो रही है…",
  "checkout.cod": "डिलीवरी पर नकद भुगतान",
  "checkout.cod.terms": "सीओडी शर्तें (डिलीवरी पर नकद)",
  "checkout.cod.dueOnDelivery": "डिलीवरी के समय देय",
  "checkout.cod.advanceNote": "ध्यान दें: कैश ऑन डिलीवरी ऑर्डर पक्का करने के लिए Razorpay के ज़रिए 100 रुपये अग्रिम भुगतान ऑनलाइन करना होगा। शेष राशि का भुगतान डिलीवरी के समय लिया जाएगा।",
  "checkout.paymentMethod": "भुगतान विधि",
  "checkout.method.online": "ऑनलाइन भुगतान",
  "checkout.method.onlineSub": "Razorpay के ज़रिए सुरक्षित भुगतान करें",
  "checkout.method.upi": "UPI / GPay",
  "checkout.method.upiSub": "स्कैन या टैप करें — रकम अपने आप भर जाएगी",
  "checkout.method.cod": "कैश ऑन डिलीवरी",
  "checkout.method.codSub": "100 रुपये अग्रिम, बाकी डिलीवरी पर",
  "checkout.placingOrder": "ऑर्डर दर्ज हो रहा है…",
  "checkout.orderDescription_one": "ऑर्डर · {count} वस्तु",
  "checkout.orderDescription_other": "ऑर्डर · {count} वस्तुएँ",

  "checkout.upi.title": "UPI से भुगतान",
  "checkout.upi.amount": "देय राशि",
  "checkout.upi.amountNote": "यह रकम पहले से भरी हुई है — आपको टाइप नहीं करनी पड़ेगी।",
  "checkout.upi.openApp": "एक टैप में भुगतान करें",
  "checkout.upi.didntWork": "काम नहीं किया? स्कैन करके भुगतान करें",
  "checkout.upi.hideQr": "वापस एक-टैप भुगतान पर",
  "checkout.upi.otherApp": "कोई भी UPI ऐप",
  "checkout.upi.scan": "स्कैन करके भुगतान करें",
  "checkout.upi.saveQr": "QR इमेज सेव करें",
  "checkout.upi.mobileStep1": "1. नीचे “QR इमेज सेव करें” दबाकर इसे फ़ोन में सेव करें।",
  "checkout.upi.mobileStep2":
    "2. Google Pay, PhonePe या Paytm खोलें, Scan दबाएँ, फिर गैलरी आइकन चुनें।",
  "checkout.upi.mobileStep3": "3. सेव की हुई इमेज चुनें — रकम पहले से भरी होगी।",
  "checkout.upi.qrAlt": "रकम सहित UPI QR कोड",
  "checkout.upi.copy": "कॉपी",
  "checkout.upi.copied": "कॉपी हुआ",
  "checkout.upi.desktopStep1": "1. अपने फ़ोन में Google Pay, PhonePe, Paytm या कोई भी UPI ऐप खोलें।",
  "checkout.upi.desktopStep2": "2. स्कैन बटन दबाएँ और ऊपर बने कोड पर कैमरा रखें।",
  "checkout.upi.desktopStep3": "3. रकम पहले से भरी होगी — बस भुगतान पक्का करें।",
  "checkout.upi.afterPaying": "भुगतान के बाद",
  "checkout.upi.refHelp":
    "अगर आपके पेमेंट ऐप में रेफ़रेंस नंबर (UPI ट्रांज़ैक्शन आईडी या UTR) दिखे, तो उसे नीचे भरें — इससे हमें आपका भुगतान जल्दी मिल जाएगा। खाली भी छोड़ सकते हैं।",
  "checkout.upi.refLabel": "UPI रेफ़रेंस नंबर",
  "checkout.upi.refOptional": "(वैकल्पिक)",
  "checkout.upi.submit": "भुगतान हो गया — ऑर्डर दर्ज करें",
  "checkout.upi.submitting": "ऑर्डर दर्ज हो रहा है…",
  "checkout.upi.cancel": "भुगतान विकल्पों पर वापस",
  "checkout.upi.verifyNote":
    "भेजने से पहले हम अपने खाते में भुगतान जाँच लेते हैं। पुष्टि होते ही आपको व्हाट्सऐप संदेश मिलेगा।",

  "pay.payingTo": "भुगतान पाने वाले",
  "pay.orderRef": "ऑर्डर",
  "pay.delivery": "डिलीवरी",
  "pay.cancel": "रद्द करके वापस जाएँ",

  "err.name": "अपना पूरा नाम भरें",
  "err.phone": "सही फ़ोन नंबर भरें",
  "err.email": "सही ईमेल भरें",
  "err.address": "अपना पूरा पता भरें",
  "err.city": "अपना शहर भरें",
  "err.state": "अपना जिला या राज्य भरें",
  "err.pincode": "सही पिनकोड भरें",
  "err.upiRef": "अपने पेमेंट ऐप का रेफ़रेंस नंबर भरें — केवल अक्षर और अंक।",
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
  "confirm.upiTitle": "ऑर्डर मिल गया",
  "confirm.upiBody":
    "ऑर्डर {id} हमें मिल गया है। हम आपका UPI भुगतान अपने खाते में जाँच रहे हैं — पुष्टि होते ही आपको व्हाट्सऐप संदेश मिलेगा, आमतौर पर कुछ घंटों में।",
  "confirm.upiRef": "आपका रेफ़रेंस",
  "confirm.upiPending": "भुगतान जाँचा जा रहा है",
  "confirm.totalPaid": "कुल भुगतान",
  "confirm.totalToPay": "देय राशि",
  "confirm.continue": "खरीदारी जारी रखें",
  "confirm.cod.breakdown": "सीओडी भुगतान विवरण",
  "confirm.cod.price": "कीमत",
  "confirm.cod.courier": "कूरियर शुल्क",
  "confirm.cod.total": "कुल योग",
  "confirm.cod.advance": "अग्रिम भुगतान",
  "confirm.cod.deliveryPay": "डिलीवरी के समय भुगतान",
  "confirm.cod.advanceNote": "100 रुपये अग्रिम भुगतान सफलतापूर्वक ऑनलाइन जमा कर दिया गया है। शेष {due} राशि का भुगतान डिलीवरी के समय नकद में लिया जाएगा।",

  "common.qty": "मात्रा {n}",
  "common.total": "कुल",
  "status.created": "बना हुआ",
  "status.paid": "भुगतान हुआ",
  "status.failed": "विफल",
  "status.cod_pending": "डिलीवरी पर नकद",
  "status.upi_pending": "भुगतान जाँचा जा रहा है",
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
  "product.shipsIn": "3–5 દિવસમાં ડિલિવરી થશે",
  "product.alsoLike": "આ પણ ગમી શકે",
  "product.size": "સાઇઝ",
  "product.color": "રંગ",
  "product.addToBag": "બેગમાં ઉમેરો",
  "product.added": "ઉમેરાયું",
  "product.addedNote":
    "અહીં દેખાતી કિંમત ફક્ત સંદર્ભ માટે છે — ચેકઆઉટ હંમેશાં કૅટલોગની હાલની કિંમતથી નક્કી કરે છે.",
  "product.viewBag": "બેગ જુઓ →",
  "product.showImage": "ઇમેજ {n} બતાવો",
  "product.selectSizeError": "કૃપા કરીને માપ (સાઇઝ) પસંદ કરો",
  "product.buyNow": "હમણાં ખરીદો",

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
  "checkout.state": "જિલ્લો / રાજ્ય",
  "checkout.pincode": "પિનકોડ",
  "checkout.addressPlaceholder": "ફ્લેટ / મકાન નં., બિલ્ડિંગ, શેરી, વિસ્તાર",
  "checkout.orderSummary": "ઓર્ડર સારાંશ",
  "checkout.estimateNote":
    "આ રકમ અંદાજિત છે — તમારી પેમેન્ટ એપમાં દેખાતી રકમ જ અમારું સર્વર હાલના કૅટલોગથી નક્કી કરશે, આ સંખ્યા નહીં.",
  "checkout.pay": "UPI થી ચુકવણી કરો",
  "checkout.preparing": "ઓર્ડર તૈયાર થઈ રહ્યો છે…",
  "checkout.waiting": "ચુકવણીની રાહ…",
  "checkout.confirming": "ચુકવણીની ખાતરી થઈ રહી છે…",
  "checkout.cod": "ડિલિવરી વખતે રોકડ ચુકવણી",
  "checkout.cod.terms": "સીઓડી શરતો (ડિલિવરી પર રોકડ)",
  "checkout.cod.dueOnDelivery": "ડિલિવરી વખતે ચૂકવવાપાત્ર",
  "checkout.cod.advanceNote": "નોંધ: કૅશ ઓન ડિલિવરી ઓર્ડર નક્કી કરવા માટે Razorpay દ્વારા 100 રૂપિયા એડવાન્સ ઓનલાઇન ચૂકવવા જરૂરી છે. બાકીની રકમ ડિલિવરી વખતે ચૂકવવાની રહેશે.",
  "checkout.paymentMethod": "ચુકવણી પદ્ધતિ",
  "checkout.method.online": "ઓનલાઇન ચુકવણી",
  "checkout.method.onlineSub": "Razorpay દ્વારા સુરક્ષિત ચુકવણી કરો",
  "checkout.method.upi": "UPI / GPay",
  "checkout.method.upiSub": "સ્કેન કરો કે ટૅપ કરો — રકમ આપોઆપ ભરાઈ જશે",
  "checkout.method.cod": "કૅશ ઓન ડિલિવરી",
  "checkout.method.codSub": "100 રૂપિયા એડવાન્સ, બાકી ડિલિવરી વખતે",
  "checkout.placingOrder": "ઓર્ડર નોંધાઈ રહ્યો છે…",
  "checkout.orderDescription_one": "ઓર્ડર · {count} વસ્તુ",
  "checkout.orderDescription_other": "ઓર્ડર · {count} વસ્તુઓ",

  "checkout.upi.title": "UPI થી ચુકવણી",
  "checkout.upi.amount": "ચૂકવવાની રકમ",
  "checkout.upi.amountNote": "આ રકમ પહેલેથી ભરેલી છે — તમારે ટાઇપ કરવાની જરૂર નથી.",
  "checkout.upi.openApp": "એક ટૅપમાં ચુકવણી કરો",
  "checkout.upi.didntWork": "કામ ન થયું? સ્કેન કરીને ચુકવણી કરો",
  "checkout.upi.hideQr": "પાછા એક-ટૅપ ચુકવણી પર",
  "checkout.upi.otherApp": "કોઈ પણ UPI એપ",
  "checkout.upi.scan": "સ્કેન કરીને ચુકવણી કરો",
  "checkout.upi.saveQr": "QR ઇમેજ સેવ કરો",
  "checkout.upi.mobileStep1": "1. નીચે “QR ઇમેજ સેવ કરો” દબાવીને તેને ફોનમાં સેવ કરો.",
  "checkout.upi.mobileStep2":
    "2. Google Pay, PhonePe કે Paytm ખોલો, Scan દબાવો, પછી ગેલેરી આઇકન પસંદ કરો.",
  "checkout.upi.mobileStep3": "3. સેવ કરેલી ઇમેજ પસંદ કરો — રકમ પહેલેથી ભરેલી હશે.",
  "checkout.upi.qrAlt": "રકમ સાથેનો UPI QR કોડ",
  "checkout.upi.copy": "કૉપી",
  "checkout.upi.copied": "કૉપી થયું",
  "checkout.upi.desktopStep1": "1. તમારા ફોનમાં Google Pay, PhonePe, Paytm કે કોઈ પણ UPI એપ ખોલો.",
  "checkout.upi.desktopStep2": "2. સ્કેન બટન દબાવો અને ઉપરના કોડ પર કૅમેરા રાખો.",
  "checkout.upi.desktopStep3": "3. રકમ પહેલેથી ભરેલી હશે — બસ ચુકવણી પાકી કરો.",
  "checkout.upi.afterPaying": "ચુકવણી પછી",
  "checkout.upi.refHelp":
    "જો તમારી પેમેન્ટ એપમાં રેફરન્સ નંબર (UPI ટ્રાન્ઝેક્શન આઈડી કે UTR) દેખાય, તો તે નીચે ભરો — તેથી અમને તમારી ચુકવણી ઝડપથી મળી જશે. ખાલી પણ છોડી શકો છો.",
  "checkout.upi.refLabel": "UPI રેફરન્સ નંબર",
  "checkout.upi.refOptional": "(વૈકલ્પિક)",
  "checkout.upi.submit": "ચુકવણી થઈ ગઈ — ઓર્ડર નોંધો",
  "checkout.upi.submitting": "ઓર્ડર નોંધાઈ રહ્યો છે…",
  "checkout.upi.cancel": "ચુકવણી વિકલ્પો પર પાછા",
  "checkout.upi.verifyNote":
    "મોકલતાં પહેલાં અમે અમારા ખાતામાં ચુકવણી તપાસી લઈએ છીએ. ખાતરી થતાં જ તમને વૉટ્સએપ સંદેશ મળશે.",

  "pay.payingTo": "ચુકવણી મેળવનાર",
  "pay.orderRef": "ઓર્ડર",
  "pay.delivery": "ડિલિવરી",
  "pay.cancel": "રદ કરીને પાછા જાઓ",

  "err.name": "તમારું પૂરું નામ ભરો",
  "err.phone": "સાચો ફોન નંબર ભરો",
  "err.email": "સાચો ઈમેલ ભરો",
  "err.address": "તમારું પૂરું સરનામું ભરો",
  "err.city": "તમારું શહેર ભરો",
  "err.state": "તમારો જિલ્લો અથવા રાજ્ય ભરો",
  "err.pincode": "સાચો પિનકોડ ભરો",
  "err.upiRef": "તમારી પેમેન્ટ એપનો રેફરન્સ નંબર ભરો — ફક્ત અક્ષરો અને અંક.",
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
  "confirm.upiTitle": "ઓર્ડર મળી ગયો",
  "confirm.upiBody":
    "ઓર્ડર {id} અમને મળી ગયો છે. અમે તમારી UPI ચુકવણી અમારા ખાતામાં તપાસી રહ્યા છીએ — ખાતરી થતાં જ તમને વૉટ્સએપ સંદેશ મળશે, સામાન્ય રીતે થોડા કલાકોમાં.",
  "confirm.upiRef": "તમારો રેફરન્સ",
  "confirm.upiPending": "ચુકવણી તપાસાઈ રહી છે",
  "confirm.totalPaid": "કુલ ચુકવણી",
  "confirm.totalToPay": "ચૂકવવાની રકમ",
  "confirm.continue": "ખરીદી ચાલુ રાખો",
  "confirm.cod.breakdown": "સીઓડી ચુકવણી વિગત",
  "confirm.cod.price": "કિંમત",
  "confirm.cod.courier": "કુરિયર ચાર્જ",
  "confirm.cod.total": "કુલ સરવાળો",
  "confirm.cod.advance": "એડવાન્સ ચુકવણી",
  "confirm.cod.deliveryPay": "ડિલિવરી વખતે ચુકવણી",
  "confirm.cod.advanceNote": "100 રૂપિયા એડવાન્સ ચુકવણી સફળતાપૂર્વક ઓનલાઇન થઈ ગઈ છે. બાકી રહેલી {due} રકમ ડિલિવરી વખતે રોકડેથી લેવામાં આવશે.",

  "common.qty": "જથ્થો {n}",
  "common.total": "કુલ",
  "status.created": "બનેલો",
  "status.paid": "ચુકવાયેલો",
  "status.failed": "નિષ્ફળ",
  "status.cod_pending": "ડિલિવરી પર રોકડ",
  "status.upi_pending": "ચુકવણી તપાસાઈ રહી છે",
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
