
function highlightWords(wordsArr, totalCheck){

    var inputText = jQuery("textarea#demo").val();

    var corrected = [];
    var partly = [];
    var wrong = [];

    var startPos = 0;


    for(var i = 0; i < totalCheck.length; i++){

        var index = inputText.indexOf(wordsArr[i], startPos);

        if(index == -1){
            return;
        }

        var arr = [index, index + wordsArr[i].length];

        if(totalCheck[i] == 0){
                corrected.push(arr);
            } else if(totalCheck[i] == 1){
                partly.push(arr);
            } else {
                wrong.push(arr);
        }

        startPos = index + wordsArr[i].length;
    }



    $('textarea#demo').highlightTextarea({
    ranges: 
        [{
            color: '#00FF00',
            ranges: corrected
          }, {
            color: '#FFFF00',
            ranges: partly
          }, {
            color: '#FF0000',
            ranges: wrong
          }]
  });

}

function getIndicesOf(searchStr, str, caseSensitive) {
    var startIndex = 0, searchStrLen = searchStr.length;
    var index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}


function getWords(text){
    text = text.replace( /\n/g, " " );
    text = text.replace(/-/g,' ');
    return text.split(/[ ,]+/).filter(Boolean);
}

function getWordsByPunctuation(text){
    return text.split(/[!.?,;:"]/).filter(Boolean);
}

function getNGramsNew(inputText){

    if(!inputText){
        alert('Value is empty');
        return;
    }


    var ngrams = 4;


    var wordsSequencePunctuation = getWordsByPunctuation(inputText);

    var data = [];
    var id = 0;

    for(var k = 0; k < wordsSequencePunctuation.length; k++) {//phrase in wordsSequencePunctuation){
       
       var phrase = wordsSequencePunctuation[k];

        var wordsSequence = getWords(phrase);

        if(wordsSequence.length <= ngrams){
            data.push(phrase);
            continue;
        } 

        //alert(wordsSequence.length);

        for (var i = 0; i < wordsSequence.length; i++) {

            if(i + ngrams > wordsSequence.length){
                break;
            }

            var str = "";
            for(var j = 0; j < ngrams; j++){
                str = str + " ";
                str = str.concat(wordsSequence[i + j]);
            }

            id++;
            //data.push({ label: id, value: str });
            //alert(str);
            data.push(str);
            str = "";
        }
    }
    return data;
}

function countTotalCheck(inputText, responseData){

    var words = getWords(inputText); //общее количество слов
    var totalCheck = Array.apply(null, new Array(words.length)).map(Number.prototype.valueOf,0);
    var step = 1; 



    var wordsSequencePunctuation = getWordsByPunctuation(inputText);


    var beginFromCheck = 0; //запоминаем позицию
    var beginFromPos = 0;

    var countNumberOfWords = 0;

    for(var k = 0; k < wordsSequencePunctuation.length; k++) {
       
       var phrase = wordsSequencePunctuation[k];

        var wordsSequence = getWords(phrase);


        countNumberOfWords += wordsSequence.length;


        var j = beginFromPos;
        var n = beginFromPos;

        for(var t = beginFromCheck; t < responseData.length; t++){

            var check = responseData[t];

            if(k < wordsSequencePunctuation.length - 1 && 
                    check.length + n > countNumberOfWords) {

                beginFromCheck = t;//запоминаем
                beginFromPos = countNumberOfWords;
                break;
            }
            
            for(var i = 0; i < check.length; i++) { 

                if((i + j) < totalCheck.length && check[i] > totalCheck[i + j]){
                    totalCheck[i + j] = check[i];
                }
            }

            j += step;
            n += step;
        }
    }

    return totalCheck;
}



function getNGrams(inputText){

    var ngrams = 4;


    if(!inputText){
        alert('Value is empty');
        return;
    }

    var wordsSequence = getWords(inputText);

    //alert(thought);


    if(wordsSequence.length <= ngrams){
        return {0:inputText};
    }

    //alert(wordsSequence.length);

    var data = [];
    var id = 0;
    
    for (var i = 0; i < wordsSequence.length; i++) {

        if(i + ngrams > wordsSequence.length){
            break;
        }

        var str = "";
        for(var j = 0; j < ngrams; j++){
            str = str + " ";
            str = str.concat(wordsSequence[i + j]);
        }

        id++;
        //data.push({ label: id, value: str });
        //alert(str);
        data.push(str);
        str = "";
    }

    //alert(arr.toString());

    return data;
}

function init(){

    //initDatabase();
    //var dbItems = selectAll(function() { alert('Success db selection!'); }, function() { alert('Error'); });


    document.getElementById("demo").focus();

    $(".yt-button").click(function(){
         $(this).toggleClass("yt-state_active");
    });



    
    $('#myform').submit(function() {
      return false;
    });

    $('textarea#demo').bind('input propertychange', function() {

        $('.container').remove();
        $('.highlightTextarea').contents().unwrap();

        document.getElementById("demo").focus();

        document.getElementById("spinner").innerHTML = "";

    });


    var myEl = document.getElementById('getit');

    myEl.addEventListener('click', function() {


    var inputText = jQuery("textarea#demo").val();
    

    var ngramsArr = getNGramsNew(inputText);


    //var ngramsArr2 = getNGramsNew(inputText);


    document.getElementById("response").innerHTML = "";

    var count = 0;

    var data = []; //check array


    var ajaxQueriesProcessed = 0;
    document.getElementById("spinner").innerHTML = "0/" + ngramsArr.length + " processed";


    var ajaxReqs = [];
    for (var key in ngramsArr) {

        var apiUrl = ("/check?q=" + ngramsArr[key].trim()).trim() + "&id=" + count;
        //document.getElementById("response").innerHTML += apiUrl + "</br >";

        ajaxReqs.push($.ajax({
            url:  apiUrl,
            type: 'GET',
            timeout: 30000,
            error: function(){
                alert('Something is wrong!');
                return true;
            },
            success: function(msg){ 
                var id = msg.id;
                data.splice(id,0, msg.check);

                ajaxQueriesProcessed++;
                document.getElementById("spinner").innerHTML = ajaxQueriesProcessed + "/" + ngramsArr.length + " processed";


                //data.push(msg);
                document.getElementById("response").innerHTML += JSON.stringify(msg) + "</br >";
            return true
            },
          cache: false
            /* AJAX settings */
        }));


        count++;
    }
    $.when.apply($, ajaxReqs).then(function() {
        // all requests are complete

        var totalCheck = countTotalCheck(inputText, data);
        var words = getWords(inputText);


        highlightWords(words, totalCheck);
    });



    }, false); //click event


    var myEl2 = document.getElementById('clearBtn');

    myEl2.addEventListener('click', function() {

        document.getElementById("spinner").innerHTML = "";

        $('.container').remove();
        $('.highlightTextarea').contents().unwrap();

        document.getElementById("response").innerHTML = "";

        var area = document.getElementById('demo');
        area.value='';
        area.focus();
    }, false);
}