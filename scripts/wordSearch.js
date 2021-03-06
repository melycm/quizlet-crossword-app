// Create a board object
$(function () {
    $("#answers").attr("disabled", "disabled");
    $("#pdf").attr("disabled", "disabled");        

    function Board(size) {
        this.size = size;
        this.board = [];
        this.clueList = [];
        this.unplacedWords = [];

        // create an empty board to the given specifications
        this.makeEmptyBoard = function () {
            for (let i = 0; i < this.size; i++) {
                let row = [];
                for (let j = 0; j < this.size; j++) {
                    row.push(" ");
                }
                this.board.push(row);
            }
        }

        // cycle through the wordlist, placing words
        this.placeWords = function (wordArr) {
            // for each word
            for (let i = 0; i < wordArr.length; i++) {
                // decide if the word is going horizontal or vertical
                if (Math.floor(Math.random() * 2) == 0) { //horizontal
                    this.placeHorizontal(wordArr[i][0], wordArr[i][1]);
                } else { //vertical
                    this.placeVertical(wordArr[i][0], wordArr[i][1]);
                }
            }
        }

        // finds a random location to see if the word will fit. Try 10 times
        this.getHorPos = function (word) {
            for (let i = 0; i < 10; i++) {
                y = Math.floor(Math.random() * (this.size));
                x = Math.floor(Math.random() * (this.size - word.length));
                if (this.canFitHor(word, x, y)) {
                    return (x, y);
                }
            }
            this.unplacedWords.push(word);
        }

        // checks to see if the word will fit horizontally in that spot.
        this.canFitHor = function (word, x, y, ) {
            for (let i = 0; i < word.length; i++) {
                if (this.board[y][x + i] != word[i] && this.board[y][x + i] != ' ') {
                    return false
                }
            }
            return true;
        }

        // places a word horizontally 
        this.placeHorizontal = function (word, clue) {
            this.getHorPos(word);
            if (!this.unplacedWords.includes(word)) {
                this.clueList.push(clue);
                for (let i = 0; i < word.length; i++) {
                    this.board[y][x + i] = [word[i].toUpperCase(), true];
                }
            }
        }

        // finds a random location to see if the word will fit. Try 10 times
        this.getVerPos = function (word) {
            for (let i = 0; i < 10; i++) {
                x = Math.floor(Math.random() * (this.size));
                y = Math.floor(Math.random() * (this.size - word.length));
                if (this.canFitVer(word, x, y)) {
                    return (x, y);
                }
            }
            this.unplacedWords.push(word);
        }

        // checks to see if the word will fit vertically in that spot.
        this.canFitVer = function (word, x, y) {
            for (let i = 0; i < word.length; i++) {
                if (this.board[y + i][x] != word[i] && this.board[y + i][x] != ' ') {
                    return false
                }
            }
            return true;
        }

        // places a word verically
        this.placeVertical = function (word, clue) {
            this.getVerPos(word);
            if (!this.unplacedWords.includes(word)) {
                this.clueList.push(clue);
                for (let i = 0; i < word.length; i++) {
                    this.board[y + i][x] = [word[i].toUpperCase(), true];
                }
            }
        }

        this.fillBoard = function () {
            let alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p",
                "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
            ];
            for (let i = 0; i < this.board.length; i++) {
                for (let j = 0; j < this.board[i].length; j++) {
                    if (this.board[i][j] == ' ') {
                        this.board[i][j] = [alphabet[Math.floor(Math.random() * 26)].toUpperCase(), false];
                    }
                }
            }
        }
    }


    function makeWordSearch(wordArr) {
        let userSize = $("#size").val();
        setSize(userSize);
        let wSBoard = new Board(size);
        wSBoard.makeEmptyBoard();
        wSBoard.placeWords(wordArr);
        wSBoard.fillBoard();
        return (wSBoard);
    }

    let size = 40;
    let switched;


    $("#importSet").click(function () {
        // get the set with the given ID
        $("#answers").removeAttr("disabled");
        $("#pdf").removeAttr("disabled");                                        
        switched = false;
        $("#display-crossword").empty();
        $("#clue-list").empty();
        $("#heading").empty();
        let url = $("#setID").val();
        importSet(url);
    });

    function setSize(userSize) {
        if (!userSize) {
            size = 40;
        } else if (userSize < 15) {
            size = 15;
        } else if (userSize > 40) {
            size = 40;
        } else {
            size = userSize;
        }
    }

    function importSet(url) {
        let id = "GRfAXGKv6t"
        let setID = getSetID(url);
        $.get("https://api.quizlet.com/2.0/sets/" + setID + "?client_id=" + id)
            .done(function (response) {
                extractSetInfo(response);
            })
            .fail(function (error) {
                console.log(error);
            })
    }

    function getSetID(url) {
        return /\d{6,}/g.exec(url)[0];
    }

    function extractSetInfo(obj) {
        $("#title").text(obj.title);
        let terms = obj.terms;
        if (!switched) {
            var wordList = terms.map(term => [term.term.toLowerCase().split(" ").join('').replace(/[^0-9a-z]/gi, ''), term.definition]);
        } else {
            var wordList = terms.map(term => [term.definition.toLowerCase().split(" ").join('').replace(/[^0-9a-z]/gi, ''), term.term]);
        }

        let wSBoard = (makeWordSearch(wordList));
        displayCrossword(wSBoard);
    }

    function displayCrossword(boardObj) {
        let board = boardObj.board;
        for (let y = 0; y < board.length; y++) {
            let $row = $("<div>", {
                "class": "text-center word-row"
            });
            for (let x = 0; x < board[y].length; x++) {
                if (board[y][x][1] == false) {
                    $($row).append(`<p class="letters word-row">${board[y][x][0]}</p>`);
                } else {
                    $($row).append(`<p class="letters reveal word-row">${board[y][x][0]}</p>`);
                }
            }
            $("#display-crossword").append($row);
        }

        // append clues to the page
        let clues = boardObj.clueList;
        for (let clue of clues) {
            let $clue = $("<li>", {
                "text": clue,
                "class": "col-6 col-md-2"
            })
            $("#clue-list").append($clue);
        }

        $("#heading").append("<p>Name:</p>");
        $("#heading").append("<p>Date:</p>");
        $("#heading").append("<p>Class:</p>");

        if (boardObj.unplacedWords.length > 0) {
            let text = boardObj.unplacedWords;
            text = text.join(", ")
            $("#unplacedwords").text(text);
            $('.modal').modal('show');
        }
    }

    $("#switch").click(function () {
        // get the set with the given ID
        $("#answers").removeAttr("disabled");
        $("#pdf").removeAttr("disabled");                                       
        switched = true;
        $("#display-crossword").empty();
        $("#clue-list").empty();
        $("#heading").empty();
        let url = $("#setID").val();
        importSet(url);
    });

    $("#answers").click(function () {
        $(".reveal").toggleClass("orange");
    })
});