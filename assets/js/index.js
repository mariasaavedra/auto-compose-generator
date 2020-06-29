function buildString(){
  let email = document.getElementById('to'),
      to = email.value,
      subject = encodeURIComponent(document.getElementById('subject').value),
      body = encodeURIComponent(document.getElementById('body').value),
      link = document.getElementById('link'),
      message = ''
  if (to){
    email.className = 'not'
    message = 'mailto:'+to
    subject||body?message+='?':false
    subject?message+='subject='+subject:false
    subject&&body?message+='&body='+body:false
    !subject&&body?message+='body='+body:false  
    //link.innerHTML = message
    sendRequest(message);
  } else {
    email.className='error'
    alert('Please enter a recipient email address','error');
    email.focus()
  }
}

function sendRequest(msg){
  // post request containing mailto string, and url.
  link = document.getElementById('link');
  axios.post('/templates', {
    template: msg
  })
  .then(function (response) {
    console.log(response.data.url);
    let href =  'http://localhost:3000/templates/' + response.data.url;
    link.href = href;
    link.innerHTML = href;
  })
  .catch(function (error) {
    console.log(error);
  });

}