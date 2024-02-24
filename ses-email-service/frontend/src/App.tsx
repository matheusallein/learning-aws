import './App.css'

const EMAIL_ENDPOINT = 'https://u0cxlpnc60.execute-api.us-east-1.amazonaws.com/dev/contact-us';

function App() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const { to, from, subject, message } = data;

    try {
      const response = await fetch(EMAIL_ENDPOINT, {
        body: JSON.stringify({ to, from, subject, message }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await response.json();
      console.log('Success:', data);
    } catch (error) {
      console.error('Error:', error)
      throw new Error('Error sending email');
    }
  }

  return (
    <>
      <h1>Contact Us</h1>
      <form onSubmit={handleSubmit}>
          <label htmlFor="to">To:</label>
          <input type="email" name="to" id="to" required={true} />
          <label htmlFor="from">From:</label>
          <input type="email" name="from" id="from" required={true} />
          <label htmlFor="subject">Subject:</label>
          <input type="text" name="subject" id="subject" required={false} />
          <label htmlFor="message">Message:</label>
          <textarea name="message" id="message" required={true} />
        <button type="submit">Send</button>
      </form>
    </>
  )
}

export default App
