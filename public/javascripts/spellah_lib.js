
function highlightWords(wordsArr, totalCheck){

    var inputText = jQuery("textarea#demo").val();

    var corrected = [];
    var partly = [];
    var wrong = [];


    for(var i = 0; i < totalCheck.length; i++){
        var ar = getIndicesOf(wordsArr[i], inputText, false);


        for(var j = 0; j < ar.length; j++){

            var arr = [ar[j], ar[j] + wordsArr[i].length];

            if(totalCheck[i] == 0){
                corrected.push(arr);
            } else if(totalCheck[i] == 1){
                partly.push(arr);
            } else {
                wrong.push(arr);
            }
        }
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
    return text.split(/[ ,]+/).filter(Boolean);
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

    });


    var myEl = document.getElementById('getit');

    myEl.addEventListener('click', function() {


    var inputText = jQuery("textarea#demo").val();
    

    var ngramsArr = getNGrams(inputText);

    document.getElementById("response").innerHTML = "";


    var data = []; //check array
    var ajaxReqs = [];
    for (var key in ngramsArr) {

        ajaxReqs.push($.ajax({
            url:  ("/check?q=" + ngramsArr[key].trim()).trim(),
            type: 'GET',
            timeout: 30000,
            error: function(){
                return true;
            },
            success: function(msg){ 
                data.push(msg.check);
                document.getElementById("response").innerHTML += JSON.stringify(msg) + "</br >";
            return true
            },
          cache: true
            /* AJAX settings */
        }));
    }
    $.when.apply($, ajaxReqs).then(function() {
        // all requests are complete

        var words = getWords(inputText);


        var totalCheck = Array.apply(null, new Array(words.length)).map(Number.prototype.valueOf,0);


        var step = 1; 
        var j = 0;

        for(var key in data){

            var check = data[key];
            
            for(var i = 0; i < check.length; i++){
                if((i + j) < totalCheck.length && check[i] > totalCheck[i + j]){
                    totalCheck[i + j] = check[i];
                }
            }
            j += step;

            //alert(totalCheck.toString());
        }


        highlightWords(words, totalCheck);
    });



    }, false); //click event


    var myEl2 = document.getElementById('clearBtn');

    myEl2.addEventListener('click', function() {

        $('.container').remove();
        $('.highlightTextarea').contents().unwrap();
        
        var area = document.getElementById('demo');
        area.value='';
        area.focus();
    }, false);

    
}

function httpGet(theUrl, ngramBlock){
    //document.write(theUrl);
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.onreadystatechange = function(){handleReadyStateChange(ngramBlock)};
    xmlHttp.send(null);

    function handleReadyStateChange(block) {
      if (xmlHttp.readyState == 4) {
        if (xmlHttp.status == 200) {
          document.getElementById("response").innerHTML += block + " " + xmlHttp.responseText + "</br >";
        }
      }
    }
}