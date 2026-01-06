// ================================================
// SALAMAT - WhatsApp API (SINGLE MESSAGE, ALL LINKS)
// ================================================

const twilio = require('twilio');

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

module.exports = async (req, res) => {
  try {
    const { to, resources,message} = req.body;

    if (!to || !resources || resources.length === 0) {
      return res.status(400).json({
        error: 'Missing "to" or "resources"'
      });
    }

    // Clean phone number
    let phone = to.replace(/[\s\-\(\)]/g, '');
    if (!phone.startsWith('+')) {
      phone = '+' + phone;
    }

    const client = twilio(TWILIO_SID, TWILIO_TOKEN);

    const typeIcons = {
      PDF: '📄',
      Video: '🎥',
      Infographic: '🖼️'
    };

    // Build ONE WhatsApp message
    const resourcesText = resources.map((r, i) => `
${i + 1}. ${typeIcons[r.type] || '📁'} *${r.title}* (${r.type})
🔗 ${r.fileUrl}
    `).join('\n');

    
    const whatsappMessage = `
🏥 *Salamat – Health Resources*

${message || 'Here are the resources you selected:'}

━━━━━━━━━━━━━━━━━━
📚 *Your Resources*
━━━━━━━━━━━━━━━━━━

${resources.map((r, i) => `
${i + 1}. ${r.title} (${r.type})
🔗 ${r.fileUrl}
`).join('')}

━━━━━━━━━━━━━━━━━━
_Sent via Salamat Healthcare Platform_
`;


    // Send ONE message only
    await client.messages.create({
  from: `whatsapp:${FROM_NUMBER}`,
  to: `whatsapp:${phone}`,
  body: whatsappMessage
});


    console.log('✅ WhatsApp message sent (single message)');

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ WhatsApp Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
