// قاعدة بيانات الافتتاحيات
const openingsDB = {
    "e4": "افتتاحية الملك (King's Pawn Opening)",
    "e4 e5": "لعبة الجانب المفتوح / الافتتاحية الكلاسيكية",
    "e4 e5 Nf3 Nc6": "افتتاحية الفارس الملكي",
    "e4 e5 Nf3 Nc6 Bb5": "افتتاحية روي لوبيز (Ruy Lopez)",
    "e4 e5 Nf3 Nc6 Bc4": "افتتاحية الإيطالية (Italian Game)",
    "e4 c5": "الدفاع الصقلي (Sicilian Defense)",
    "e4 c5 Nf3 Nc6": "الدفاع الصقلي: التفرع الكلاسيكي",
    "e4 e6": "الدفاع الفرنسي (French Defense)",
    "e4 c6": "دفاع كارو-كان (Caro-Kann Defense)",
    "e4 Nf6": "دفاع أليخين (Alekhine's Defense)",
    "d4": "افتتاحية الوزير (Queen's Pawn Opening)",
    "d4 d5": "مباراة الوزير المقابلة (Closed Game)",
    "d4 d5 c4": "مناورة الوزير (Queen's Gambit)",
    "d4 d5 c4 e6": "مناورة الوزير المرفوضة",
    "d4 Nf6": "الدفاع الهندي (Indian Defense)",
    "d4 Nf6 c4 g6": "دفاع جرينفيلد أو الملك الهندي",
    "c4": "الافتتاحية الإنجليزية (English Opening)",
    "Nf3": "افتتاحية ريتي (Reti Opening)"
};

var board = null;
var game = new Chess();
var statusEl = $('#status');
var openingEl = $('#opening-name');
var evalResultEl = $('#eval-result');

function checkOpening() {
    var history = game.history();
    var historyString = history.join(" ");
    
    let detected = "افتتاحية حرة / غير مسجلة في القائمة الرئيسية";
    let matchedKey = "";
    for (let key in openingsDB) {
        if (historyString.startsWith(key)) {
            if (key.length > matchedKey.length) {
                matchedKey = key;
                detected = openingsDB[key];
            }
        }
    }
    if (history.length === 0) {
        detected = "بداية اللعبة (الموقف الابتدائي)";
    }
    openingEl.html(`<b>الافتتاحية:</b> ${detected}`);
}

function updateStatus() {
    var moveColor = (game.turn() === 'w') ? 'الأبيض' : 'الأسود';
    if (game.in_checkmate()) {
        statusEl.text('كش مات! انتهت اللعبة.');
    } else if (game.in_draw()) {
        statusEl.text('تعادل!');
    } else {
        statusEl.text('دور اللاعب: ' + moveColor + (game.in_check() ? ' (كش!)' : ''));
    }
    checkOpening();
}

function onDragStart(source, piece, position, orientation) {
    if (game.game_over()) return false;
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }
}

function onDrop(source, target) {
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });
    if (move === null) return 'snapback';
    updateStatus();
}

function onSnapEnd() {
    board.position(game.fen());
}

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
};

board = Chessboard('board', config);
updateStatus();

$('#reset-btn').on('click', function () {
    game.reset();
    board.start();
    updateStatus();
    evalResultEl.text('تمت إعادة ضبط اللوحة.');
});

$('#analyze-btn').on('click', function () {
    evalResultEl.text('جاري تحليل الموقف بواسطة المحرك...');
    var fen = game.fen();
    
    $.get('https://stockfish.online/api/s/v2.php?fen=' + encodeURIComponent(fen) + '&depth=10', function(data) {
        if (data.success) {
            var evaluationText = data.mate ? `إماتة قريبة خلال ${data.mate} نقلات!` : `التقييم: ${data.evaluation > 0 ? '+' : ''}${data.evaluation / 100}`;
            evalResultEl.html(`<b>التحليل:</b><br>${evaluationText}<br><small>أفضل نقلة: ${data.bestmove.split(' ')[1] || 'متاحة'}</small>`);
        } else {
            evalResultEl.text('تعذر جلب التحليل.');
        }
    }).fail(function() {
        evalResultEl.text('خطأ في الاتصال بالخادم.');
    });
});
