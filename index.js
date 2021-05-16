const axios = require('axios');
const moment = require('moment');
const qs = require('querystring');
const dotenv = require('dotenv');

dotenv.config();

const PINCODE = process.env.PINCODE;

const findSlot = async () => {
  const date = moment().format('DD-MM-YYYY');
  const response = await axios.get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${PINCODE}&date=${date}`, {
    headers: {
      'User-Agent': 'PostmanRuntime/7.25.0'
    }
  });
  const centers = response.data.centers;
  const availablecenters = [];
  centers.forEach((center) => {
    // session.available_capacity > 0 &&
    const sessions = center.sessions.filter((session) => session.available_capacity > 0 && session.min_age_limit === process.env.MIN_AGE);
    if (sessions.length) {
      center.matchedSession = sessions;
      availablecenters.push(center);
    }
  });
  return availablecenters;
}

const createMessageBody = (centers) => {
  let body = `Co-Win Vaccine Slots are available for pincode: ${PINCODE} \n`;
  centers.forEach(center => {
    const dates = center.matchedSession.reduce((acc, next) => {
      acc.push(next.date);
      return acc;
    }, []);
    body += `Center: ${center.name} for dates: ${dates.join(', ')} \n`;
  });
  return body;
}

const sendWhatsappNotif = async (body, number) => {
  const response = await axios.post(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, qs.stringify({
    To: `whatsapp:${number}`,
    From: `whatsapp:${process.env.FROM_TW_WHATSAPP}`,
    Body: body
  }), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    auth: {
      username: process.env.TWILIO_ACCOUNT_SID,
      password: process.env.TWILIO_AUTH_TOKEN
    }
  });
  console.log(response);

}

const init = async() => {
  // setInterval(async () => {
    try {
      const availablecenters = await findSlot();
      if (availablecenters.length) {
        const message = createMessageBody(availablecenters);
        await sendWhatsappNotif(message, process.env.PRIMARY_NUMBER);
        await sendWhatsappNotif(message, process.env.SECONDARY_NUMBER);
      }
    } catch (e) {
      console.error(e);
    }
  // }, process.env.FREQUENCY);
}


init();