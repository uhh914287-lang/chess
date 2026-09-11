// بيانات مستكشف الافتتاحيات السريع لتطبيقها بنقرة واحدة
const explorerMoves = [
    { name: "👑 افتتاحية الملك (e4)", moves: ["e4", "e5"] },
    { name: "🛡️ الدفاع الصقلي (Sicilian)", moves: ["e4", "c5"] },
    { name: "♞ الدفاع الفرنسي (French)", moves: ["e4", "e6"] },
    { name: "🎯 افتتاحية الوزير (d4)", moves: ["d4", "d5"] },
    { name: "♟️ مناورة الوزير (Queen's Gambit)", moves: ["d4", "d5", "c4"] },
    { name: "⚡ الدفاع الهندي", moves: ["d4", "Nf6"] },
    { name: "🌐 الافتتاحية الإنجليزية", moves: ["c4"] }
];

function updateExplorer() {
    const explorerBox = $('#explorer-box');
    explorerBox.empty();

    explorerMoves.forEach(item => {
        const div = $('<div class="explorer-item"></div>').text(item.name);
        div.on('click', function() {
            // إعادة ضبط اللعبة وتطبيق تسلسل نقلات الافتتاحية مباشرة
            game.reset();
            item.moves.forEach(m => {
                game.move(m);
            });
            board.position(game.fen());
            updateStatus();
        });
        explorerBox.append(div);
    });
}

// تشغيل المستكشف عند تحميل الصفحة
$(document).ready(function() {
    updateExplorer();
});
