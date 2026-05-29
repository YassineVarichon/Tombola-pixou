document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // DOM ELEMENTS
    // ==========================================================================
    const tombolaForm = document.getElementById('tombola-form');
    const submitButton = document.getElementById('submit-button');
    const formCard = document.querySelector('.form-card');
    const successCard = document.querySelector('.id-success-card');
    const userDisplayName = document.getElementById('user-display-name');
    const btnAnotherParticipation = document.getElementById('btn-another-participation');
    const phoneInput = document.getElementById('phone');

    // Rules Modal Elements
    const btnRules = document.getElementById('btn-rules');
    const rulesModal = document.getElementById('rules-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const btnCloseRules = document.getElementById('btn-close-rules');

    // Secret Admin Elements
    const copyrightText = document.getElementById('copyright-text');
    const adminPanel = document.getElementById('admin-panel');
    const closeAdminBtn = document.getElementById('close-admin-btn');
    const participantsListBody = document.getElementById('participants-list-body');
    const noParticipantsMsg = document.getElementById('no-participants-msg');
    const totalRegistrations = document.getElementById('total-registrations');
    const btnExportCsv = document.getElementById('btn-export-csv');
    const btnClearDb = document.getElementById('btn-clear-db');

    // State Variables
    let secretClickCount = 0;

    // ==========================================================================
    // PHONE NUMBER FORMATTING & VALIDATION (FRENCH FORMAT)
    // ==========================================================================
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            // Remove non-digit characters
            let input = e.target.value.replace(/\D/g, '');
            
            // Limit to 10 digits
            if (input.length > 10) {
                input = input.substring(0, 10);
            }
            
            // Format as 06 12 34 56 78
            let formatted = '';
            for (let i = 0; i < input.length; i++) {
                if (i > 0 && i % 2 === 0) {
                    formatted += ' ';
                }
                formatted += input[i];
            }
            
            e.target.value = formatted;
        });
    }

    // ==========================================================================
    // FORM SUBMISSION & LOCAL STORAGE
    // ==========================================================================
    if (tombolaForm) {
        tombolaForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const firstname = document.getElementById('firstname').value.trim();
            const lastname = document.getElementById('lastname').value.trim();
            const email = document.getElementById('email').value.trim();
            const rawPhone = phoneInput.value.replace(/\s/g, '');

            // Basic checks
            if (firstname.length < 2) {
                alert('Veuillez entrer un prénom valide (2 caractères minimum).');
                return;
            }

            if (lastname.length < 2) {
                alert('Veuillez entrer un nom valide (2 caractères minimum).');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Veuillez entrer une adresse e-mail valide.');
                return;
            }

            if (rawPhone.length < 10) {
                alert('Veuillez entrer un numéro de téléphone français valide à 10 chiffres.');
                return;
            }

            // Lock submit button
            submitButton.disabled = true;
            const originalBtnText = submitButton.querySelector('span').innerText;
            submitButton.querySelector('span').innerText = 'ENREGISTREMENT...';

            // Simulate small backend delay (looks premium and robust)
            setTimeout(() => {
                const now = new Date();
                const dateTimeStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

                // Generate random unique ticket number
                const ticketNum = Math.floor(10000 + Math.random() * 90000);

                const participant = {
                    ticket: ticketNum,
                    prenom: firstname,
                    nom: lastname,
                    email: email,
                    telephone: phoneInput.value,
                    date: dateTimeStr,
                    timestamp: now.getTime()
                };

                // Retrieve and push to LocalStorage
                let participants = JSON.parse(localStorage.getItem('pixou_tombola_participants')) || [];
                
                // Check if phone already registered (optional limit)
                const alreadyExists = participants.some(p => p.telephone.replace(/\s/g, '') === rawPhone);
                if (alreadyExists) {
                    alert('Ce numéro de téléphone est déjà inscrit à la tombola ! Un seul enregistrement par personne.');
                    submitButton.disabled = false;
                    submitButton.querySelector('span').innerText = originalBtnText;
                    return;
                }

                participants.push(participant);
                localStorage.setItem('pixou_tombola_participants', JSON.stringify(participants));

                // Send to Google Sheets in Real-Time
                const googleSheetUrl = 'https://script.google.com/macros/s/AKfycbyOk-hHN9A897tSLY1IF2dffizBs57TGHzgCgXiNKTCGJQ0ptNv-lON4_BbEbFBMhfs/exec';
                
                fetch(googleSheetUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(participant)
                })
                .then(() => {
                    console.log('Synchronisé avec Google Sheet avec succès !');
                })
                .catch((err) => {
                    console.error('Erreur lors de la synchronisation Google Sheet :', err);
                });

                // Success UI transition
                userDisplayName.innerText = firstname;
                const ticketEl = document.getElementById('user-ticket-number');
                if (ticketEl) ticketEl.innerText = ticketNum;
                formCard.style.display = 'none';
                successCard.style.display = 'block';

                // Reset form
                tombolaForm.reset();
                submitButton.disabled = false;
                submitButton.querySelector('span').innerText = originalBtnText;
            }, 1000);
        });
    }

    // Allow entering another participant (convenient for testing and multiple entries in physical stands)
    if (btnAnotherParticipation) {
        btnAnotherParticipation.addEventListener('click', () => {
            successCard.style.display = 'none';
            formCard.style.display = 'block';
        });
    }

    // ==========================================================================
    // RULES MODAL INTERACTION
    // ==========================================================================
    const openRules = (e) => {
        if (e) e.preventDefault();
        rulesModal.classList.add('visible');
    };

    const closeRules = () => {
        rulesModal.classList.remove('visible');
    };

    if (btnRules) btnRules.addEventListener('click', openRules);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeRules);
    if (btnCloseRules) btnCloseRules.addEventListener('click', closeRules);

    // Close modals clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === rulesModal) {
            closeRules();
        }
        if (e.target === adminPanel) {
            closeAdmin();
        }
    });

    // ==========================================================================
    // SECRET ADMIN PANEL (Click 5 times on copyright)
    // ==========================================================================
    if (copyrightText) {
        copyrightText.addEventListener('click', () => {
            secretClickCount++;
            if (secretClickCount === 5) {
                secretClickCount = 0;
                openAdmin();
            }
        });
    }

    const openAdmin = () => {
        adminPanel.classList.add('visible');
        renderParticipants();
    };

    const closeAdmin = () => {
        adminPanel.classList.remove('visible');
    };

    if (closeAdminBtn) closeAdminBtn.addEventListener('click', closeAdmin);

    // Render registered participants in table
    const renderParticipants = () => {
        const participants = JSON.parse(localStorage.getItem('pixou_tombola_participants')) || [];
        totalRegistrations.innerText = participants.length;
        participantsListBody.innerHTML = '';

        if (participants.length === 0) {
            noParticipantsMsg.style.display = 'block';
            return;
        }

        noParticipantsMsg.style.display = 'none';

        // Sort descending by timestamp (newest first)
        const sorted = [...participants].sort((a, b) => b.timestamp - a.timestamp);

        sorted.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="badge" style="background: rgba(220, 38, 38, 0.08); color: var(--primary); font-weight: 700; padding: 4px 8px; border-radius: 4px; font-family: monospace;">#${p.ticket || '-----'}</span></td>
                <td>${p.date}</td>
                <td><strong>${escapeHtml(p.prenom)}</strong></td>
                <td><strong>${escapeHtml(p.nom || '')}</strong></td>
                <td><a href="mailto:${escapeHtml(p.email || '')}" class="text-link">${escapeHtml(p.email || '')}</a></td>
                <td><code style="font-family: monospace; font-size: 1rem;">${escapeHtml(p.telephone)}</code></td>
            `;
            participantsListBody.appendChild(tr);
        });
    };

    // Helper to escape inputs for safety
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ==========================================================================
    // EXPORT TO EXCEL (CSV) & CLEAR DB
    // ==========================================================================
    if (btnExportCsv) {
        btnExportCsv.addEventListener('click', () => {
            const participants = JSON.parse(localStorage.getItem('pixou_tombola_participants')) || [];
            if (participants.length === 0) {
                alert("Aucune inscription à exporter pour l'instant !");
                return;
            }

            // UTF-8 BOM to ensure special characters and accents display properly in Excel
            let csvContent = "\uFEFF";
            
            // CSV Header
            csvContent += "Ticket;Date d'inscription;Prénom;Nom;E-mail;Téléphone\n";

            // Add rows
            participants.forEach(p => {
                csvContent += `"#${p.ticket || ''}";"${p.date}";"${p.prenom}";"${p.nom || ''}";"${p.email || ''}";"${p.telephone}"\n`;
            });

            // Create blob and trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            
            link.setAttribute("href", url);
            link.setAttribute("download", `tombola_pixou_participants_${new Date().toISOString().slice(0,10)}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Reset database with validation
    if (btnClearDb) {
        btnClearDb.addEventListener('click', () => {
            const participants = JSON.parse(localStorage.getItem('pixou_tombola_participants')) || [];
            if (participants.length === 0) {
                alert("La liste est déjà vide !");
                return;
            }

            const confirmClear = confirm("🚨 Attention : Êtes-vous sûr de vouloir réinitialiser TOUTE la liste des participants ? Cette action est irréversible.");
            if (confirmClear) {
                localStorage.removeItem('pixou_tombola_participants');
                renderParticipants();
                alert("La base de données locale a été réinitialisée avec succès.");
            }
        });
    }
});
