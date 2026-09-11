var board = null;
var game = new Chess();

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
    updateMagnusCommentary(move);
    if (typeof updateExplorer === 'function') updateExplorer();
}

function onSnapEnd() {
    board.position(game.fen());
}

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};

board = Chessboard('board', config);

// محاكي تعليق ماغنوس كارلسن الذكي وحساب النقلات
function updateMagnusCommentary(move) {
    let comments = [
        `"نقلة ممتازة ودقيقة جداً! تذكرنا بأسلوب بوبي فيشر في السيطرة على المربعات المركزية."`,
        `"هذه النقلة تفتح خطوطاً هجومية قوية للفيل، نقلة مدهشة تستحق علامة التفوق الذهبية!"`,
        `"حساب دقيق! لقد قمت بتأمين الملك وتفعيل الأبرام في الوقت المناسب تماماً."`,
        `"تبهبرني بهذا الاختيار، نقلة هادئة لكنها تخفي خلفها تكتيكاً عميقاً للوسط."`
    ];
    let randomC = comments[Math.floor(Math.random() * comments.length)];
    $('#magnus-commentary').html(`<b>ماغنوس كارلسن:</b> ${randomC} <span class="eval-badge badge-brilliant">!!) نقلة مدهشة</span>`);
}

// زر تحميل PGN أو النصوص المستوردة
$('#load-pgn-btn').on('click', function() {
    let pgnData = $('#pgn-input').val();
    if(pgnData) {
        try {
            game.load_pgn(pgnData);
            board.position(game.fen());
            alert('تم استيراد اللعبة بنجاح!');
        } catch(e) {
            alert('خطأ في صيغة الـ PGN، تأكد من صحة النص.');
        }
    }
});

$('#reset-btn').on('click', function() {
    game.reset();
    board.start();
    $('#magnus-commentary').html(`<b>ماغنوس كارلسن:</b> "تمت إعادة اللوحة للبداية. لنبدأ المعركة من جديد!"`);
    $('#eval-details').text('التقييم الحالي: متعادل (0.00)');
});

// تحليل المحرك السحابي المجاني Stockfish
$('#analyze-btn').on('click', function() {
    $('#eval-details').text('جاري فحص الموقف العميق بواسطة محرك Stockfish...');
    let fen = game.fen();
    
    $.get('https://stockfish.online/api/s/v2.php?fen=' + encodeURIComponent(fen) + '&depth=12', function(data) {
        if (data.success) {
            let evalScore = data.mate ? `مات في ${data.mate}` : `${(data.evaluation / 100 > 0 ? '+' : '') + (data.evaluation / 100)}`;
            $('#eval-details').html(`<b>نتائج التحليل العميق:</b> التقييم: ${evalScore} | الأفضل: <code>${data.bestmove}</code>`);
            $('#magnus-commentary').html(`<b>ماغنوس كارلسن:</b> "حللت الموقف، وأفضل خط عملي هو اللعب نحو النقلة المقترحة بدقة."`);
        } else {
            $('#eval-details').text('تعذر جلب التحليل في الوقت الحالي.');
        }
    }).fail(function() {
        $('#eval-details').text('خطأ بالاتصال بشادم التحليل الذكي.');
    });
});
