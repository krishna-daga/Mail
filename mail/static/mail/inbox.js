document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit=()=>{

    fetch('/emails', {
      method: 'POST',
      // get form inputs
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value

          
      })
      
    })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
      //loads sent mailbox 
      load_mailbox('sent');

  });
  
  // By default, load the inbox
  load_mailbox('inbox');

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
}
  

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch('/emails/inbox')
.then(response => response.json())
.then(emails => {
    // Print emails
    console.log(emails);
    //let emails_view = document.querySelector("#emails-view");
    if (emails.length==0){
      document.querySelector("#message")='No emails';
    }
    else{
      emails.forEach(email => {
        const mail=document.createElement('div');
        const from=document.createElement('p');
        const subj=document.createElement('p');
        const time=document.createElement('p');

        if (!email.read)
          mail.style.backgroundColor = "lightgrey"

        from.innerHTML=email.sender;
        subj.innerHTML=email.subject;
        time.innerHTML=email.timestamp;
        email_view.appendChild(mail);
        mail.appendChild(from);
        mail.appendChild(subj);
        mail.appendChild(time);
      });
    }

}
// function send_email() 