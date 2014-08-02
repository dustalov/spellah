

function getWords() {
    return ['Lorem ipsum'];
}

function highlightWords(arr){

    $('textarea').highlightTextarea({
    words: arr
  });

}

function getNGrams(){

    var ngrams = 4;

    var str = jQuery("textarea#demo").val();

    if(!str){
        alert('Value is empty');
        return;
    }
    //alert(thought);

    var arr = str.split(/[ ,]+/).filter(Boolean);

    if(arr.length <= ngrams){
        return [str];
    }

    //alert(arr.toString());
    var data = [];
    var id = 0;
    
    for (var i = 0; i < arr.length; i++) {

        if(i + ngrams > arr.length){
            break;
        }

        var str = "";
        for(var j = 0; j < ngrams; j++){
            str = str + " ";
            str = str.concat(arr[i + j]);
        }

        id++;
        data.push({ label: id, value: str });
        str = "";
    }

    for (var key in data) {
      if (key === 'length' || !data.hasOwnProperty(key)) continue;
      var value = data[key];
      alert(value.value);
    }

    //alert(data.toString());
}

function init(){
    
    $('#myform').submit(function() {
      return false;
    });


    var myEl = document.getElementById('getit');

    myEl.addEventListener('click', function() {
        var arr = getNGrams();
        alert(arr.toString());
    }, false);




    highlightWords(getWords());
}