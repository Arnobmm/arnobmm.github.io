
document.getElementById("contact-form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let message = document.getElementById("message").value;
    
    document.getElementById("response").innerText = `Thanks, ${name}! I will get back to you at ${email}.`;
    
    this.reset();
});
