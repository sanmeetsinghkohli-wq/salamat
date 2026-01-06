    // ================================================
    // SALAMAT - Health Resource Sharing Platform
    // ================================================

    // ================================================
    // RESOURCES
    // ================================================

    const RESOURCES = {
        'health-guide': {
            id: 'health-guide',
            title: 'Patient Health Guide',
            type: 'PDF',
            description: 'Complete health guide for patients',
            fileUrl: 'https://res.cloudinary.com/dwrsruuty/raw/upload/v1234567890/health-guide.pdf',
            get previewUrl() {
                return this.fileUrl;
            }
        },
        'exercise-video': {
            id: 'exercise-video',
            title: 'Exercise Tutorial',
            type: 'Video',
            description: 'Simple exercises for better health',
            fileUrl: 'https://res.cloudinary.com/dwrsruuty/video/upload/v1766348856/The_PERFECT_Mobility_Routine_to_FIX_YOUR_SIT_3_MinDay__1080p_ptyy30.mp4',
            get previewUrl() {
                return this.fileUrl;
            }
        },
        'medical-guidelines': {
            id: 'medical-guidelines',
            title: 'Medical Guidelines for Healthy Living',
            type: 'Infographic',
            description: 'Essential medical guidelines and tips',
            fileUrl: 'https://res.cloudinary.com/dwrsruuty/image/upload/v1766410062/WhatsApp_Image_2025-12-22_at_11.16.30_AM_aayp9j.jpg',
            get previewUrl() {
                return this.fileUrl;
            }
        }
    };

    // ================================================
    // INITIALIZE
    // ================================================

    document.addEventListener('DOMContentLoaded', function () {
        lucide.createIcons();
        renderResources();
        initializeForm();
    });

    // ================================================
    // RENDER RESOURCES
    // ================================================

    function renderResources() {
        const grid = document.getElementById('resourcesGrid');
        const icons = {
            'PDF': 'file-text',
            'Video': 'video',
            'Infographic': 'image'
        };

        let html = '';

        for (const [key, resource] of Object.entries(RESOURCES)) {
            html += `
                <div class="resource-card">
                    <input type="checkbox" class="resource-checkbox" id="${key}">
                    <label for="${key}" class="resource-content">
                        <div class="resource-header">
                            <div class="resource-icon">
                                <i data-lucide="${icons[resource.type]}"></i>
                            </div>
                            <div class="check-icon">
                                <i data-lucide="check"></i>
                            </div>
                        </div>
                        <h4>${resource.title}</h4>
                        <p>${resource.description}</p>
                        <span class="resource-tag">${resource.type}</span>
                        <a href="${resource.previewUrl}" target="_blank" class="preview-btn" onclick="event.stopPropagation()">
                            👁️ Preview
                        </a>
                    </label>
                </div>
            `;
        }

        grid.innerHTML = html;
        lucide.createIcons();

        document.querySelectorAll('.resource-checkbox')
            .forEach(cb => cb.addEventListener('change', updateSelectedResources));
    }

    // ================================================
    // RESOURCE SELECTION
    // ================================================

    function getSelectedResources() {
        return Array.from(document.querySelectorAll('.resource-checkbox:checked'))
            .map(cb => cb.id);
    }

    function updateSelectedResources() {
        const container = document.getElementById('selectedResources');
        const selected = getSelectedResources();

        if (!selected.length) {
            container.innerHTML = '<p class="no-resources">No resources selected</p>';
            return;
        }

        container.innerHTML = selected.map(key => `
            <div class="selected-resource-item">
                <span>${RESOURCES[key].title}</span>
                <button type="button" onclick="removeResource('${key}')">
                    <i data-lucide="x"></i>
                </button>
            </div>
        `).join('');

        lucide.createIcons();
    }

    function removeResource(key) {
        document.getElementById(key).checked = false;
        updateSelectedResources();
    }

    // ================================================
    // FORM HANDLING
    // ================================================

    function initializeForm() {
        document.getElementById('resourceForm').addEventListener('submit', async function (e) {
            e.preventDefault();

            const recipientEmail = document.getElementById('recipientEmail').value.trim();
            const recipientWhatsApp = document.getElementById('recipientWhatsApp').value.trim();
            const message = document.getElementById('message').value.trim();
            const sendEmail = document.getElementById('sendEmail').checked;
            const sendWhatsApp = document.getElementById('sendWhatsApp').checked;

            const selectedResources = getSelectedResources();
            const resources = selectedResources.map(key => RESOURCES[key]);

            if (!resources.length) return showError('Please select at least one resource.');
            if (!sendEmail && !sendWhatsApp) return showError('Select at least one sending method.');
            if (sendWhatsApp && !recipientWhatsApp.startsWith('+971'))
                return showError('WhatsApp number must start with +971');

            const btn = document.getElementById('submitBtn');
            btn.disabled = true;
            btn.innerHTML = 'Sending...';

            const result = { email: false, whatsapp: false };

            try {
                if (sendEmail) {
                    const r = await sendEmailAPI({ recipientEmail, message, resources });
                    if (r.success) result.email = true;
                }

                if (sendWhatsApp) {
                    const r = await sendWhatsAppAPI({ recipientWhatsApp, resources,message });
                    if (r.success) result.whatsapp = true;
                }

                if (result.email || result.whatsapp) {
                    showSuccess(result);
                    resetForm();
                } else {
                    showError('Failed to send.');
                }
            } catch (err) {
                console.error(err);
                showError('Something went wrong.');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i data-lucide="send"></i> SEND RESOURCES';
                lucide.createIcons();
            }
        });
    }

    // ================================================
    // EMAIL API (UNCHANGED)
    // ================================================

    async function sendEmailAPI({ recipientEmail, message, resources }) {
    const typeIcons = {
        PDF: '📄',
        Video: '🎥',
        Infographic: '🖼️'
    };

    // Plain text fallback
    const resourcesText = resources.map(r =>
        `${typeIcons[r.type]} ${r.title}\nDownload: ${r.fileUrl}`
    ).join('\n\n');

    // HTML cards
    const resourcesHtml = resources.map(r => `
        <div style="border:1px solid #e0e0e0;padding:15px;border-radius:8px;margin-bottom:15px;">
            <h3 style="margin:0 0 8px;">${typeIcons[r.type]} ${r.title}</h3>
            <p style="margin:0 0 10px;color:#555;">Type: ${r.type}</p>
            <a href="${r.fileUrl}"
               style="display:inline-block;padding:8px 14px;background:#43A047;color:white;border-radius:6px;text-decoration:none">
               📥 Download File
            </a>
        </div>
    `).join('');

    const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to: recipientEmail,
            subject: '🏥 Salamat - Health Resources',
            text: `
Hello!

${message || 'Here are your health resources.'}

${resourcesText}

— Salamat Healthcare
            `,
            html: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px;">
    <div style="max-width:600px;margin:auto;background:white;padding:25px;border-radius:10px;">
        <h2 style="color:#2E7D32;">🏥 Salamat Healthcare</h2>

        <p>${message || 'Here are your health resources.'}</p>

        <h3 style="margin-top:25px;">📚 Your Resources</h3>
        ${resourcesHtml}

        <p style="font-size:12px;color:#777;margin-top:30px;">
            Sent via Salamat Healthcare Platform
        </p>
    </div>
</body>
</html>
            `
        })
    });

    return await response.json();
}
    // ================================================
    // WHATSAPP API (ONLY CHANGE IS HERE)
    // ================================================

    async function sendWhatsAppAPI({ recipientWhatsApp, resources,message }) {
        return fetch('/api/whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
    to: recipientWhatsApp,
    message,
    resources
})

        }).then(r => r.json());
    }

    // ================================================
    // UI HELPERS
    // ================================================

    function resetForm() {
        document.getElementById('resourceForm').reset();
        document.querySelectorAll('.resource-checkbox').forEach(cb => cb.checked = false);
        updateSelectedResources();
    }

    function showSuccess(results) {
        document.getElementById('modalMessage').textContent =
            results.email && results.whatsapp
                ? 'Sent via Email & WhatsApp!'
                : results.email
                    ? 'Sent via Email!'
                    : 'Sent via WhatsApp!';
        document.getElementById('successModal').classList.add('show');
    }

    function showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorModal').classList.add('show');
    }
