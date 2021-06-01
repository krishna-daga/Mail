document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_email(event) {

  fetch('/emails' , {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => load_mailbox('sent'));
}

function load_email(id) {
  fetch('/emails/' + id)
  .then(response => response.json())
  .then(email => {

    // show email and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';

    // display email
    const view = document.querySelector('#email-view');
    view.innerHTML = `
      <ul class="list-group">
        <li class="list-group-item"><b>From:</b> <span>${email.sender}</span></li>
        <li class="list-group-item"><b>To: </b><span>${email.recipients}</span></li>
        <li class="list-group-item"><b>Subject:</b> <span>${email.subject}</span</li>
        <li class="list-group-item"><b>Time:</b> <span>${email.timestamp}</span></li>
        <li class="list-group-item"><p class="mb-1">${email.body}</p></li>
      </ul>
    `;
    //reply button
    const reply = document.createElement('button');
    reply.className = "btn-primary";
    reply.innerHTML = "Reply";
    reply.addEventListener('click', function() {
      compose_email();
      //pre populate
      document.querySelector('#compose-recipients').value = email.sender;
      let subject = email.subject;
      console.log(subject.split(" ", 1)[0]);
      if (subject.split(" ", 1)[0] != "Re:") {
        subject = "Re: " + subject;
      }
      document.querySelector('#compose-subject').value = subject;
      //pre populate
      let body = `
        On ${email.timestamp}, ${email.sender} wrote: ${email.body}
      `;
      document.querySelector('#compose-body').value = body;

    });

    view.appendChild(reply);

    //archive
    archiveButton = document.createElement('button');
    archiveButton.className = "btn-primary";
    archiveButton.innerHTML = !email.archived ? 'Archive' : 'Unarchive';
    archiveButton.addEventListener('click', function() {
      fetch('/emails/' + email.id, {
        method: 'PUT',
        body: JSON.stringify({ archived : !email.archived })
      })
      .then(response => load_mailbox('inbox'))
    });
    view.appendChild(archiveButton);
    //read button
    readButton = document.createElement('button');
    readButton.className = "btn-secondary";
    readButton.innerHTML = "Mark as Unread"
    readButton.addEventListener('click', function() {
      fetch('/emails/' + email.id, {
        method: 'PUT',
        body: JSON.stringify({ read : false })
      })
      .then(response => load_mailbox('inbox'))
    })
    view.appendChild(readButton);

    // mark this email as read
    if (!email.read) {
      fetch('/emails/' + email.id, {
        method: 'PUT',
        body: JSON.stringify({ read : true })
      })
    }
  });
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name 
  const view = document.querySelector('#emails-view');
  view.innerHTML = `<h5>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h5>`;


  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {

    // generate div for each email
    emails.forEach(email => {
        let div = document.createElement('div');
        let from=document.createElement('h6');
        let subj=document.createElement('h7');
        let time=document.createElement('h7');
        div.style.borderStyle = 'solid';
        div.style.borderColor = '#007bff';
        div.style.borderWidth='0.1rem'; 
        from.style.display='inline-block';
        subj.style.display='inline-block';
        time.style.display='inline-block';
        subj.style.margin = '1rem';
        time.style.margin = '1rem';
        from.style.margin = '1rem';
        if (!email.read)
                        div.style.backgroundColor = "lightgrey"

        from.innerHTML=email.sender;
        subj.innerHTML=email.subject;
        time.innerHTML=email.timestamp;

        div.addEventListener('click', () => load_email(email.id));
        view.appendChild(div);
        div.appendChild(from);
        div.appendChild(subj);
        div.appendChild(time);
    });
  })
}
