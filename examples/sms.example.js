const accountSid = ''; 
const authToken = ''; 
const client = require('twilio')(accountSid, authToken); 
 
client.messages 
      .create({ 
         body: 'Cowin Vaccine Slots are available for pincode: XXXXX \n Center: Test',  
         messagingServiceSid: '',      
         to: '+91XXXX' 
       }) 
      .then(message => console.log(message.sid)) 
      .done();