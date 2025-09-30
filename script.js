document.addEventListener('DOMContentLoaded', () => {
    let activeConversationId = null;
    let activeChannel = null;
    const connectionStatus = {
        whatsapp: false,
        instagram: false,
        facebook: false,
        webchat: false
    };
    const accountNames = {
        whatsapp: "Guapas Cosmeticos",
        facebook: "@Guapas Cosmeticos Oficial",
        instagram: "GuapasCosmeticosOfficial",
        webchat: "Guapa Bot"
    };
    const simulatedConversations = {
        whatsapp: [],
        instagram: [],
        facebook: [],
        webchat: [],
    };

    let activeConfigTab = 'api';
    let knowledgeBase = [
        { id: 1, trigger: "precios", response: "Nuestra lista de precios se encuentra en el enlace [LINK_CATALOGO]." },
        { id: 2, trigger: "envios", response: "Hacemos envíos a todo el país por MRW y Zoom. Tardan 2-3 días hábiles." },
        { id: 3, trigger: "hola", response: "¡Hola! ✨ Gracias por contactar a Guapas Cosméticos. ¿Cómo podemos ayudarte hoy?" }
    ];
    let diffusionContacts = 0; // Contactos cargados para difusión

    const sidebar = document.getElementById('sidebar');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const chatLayout = document.getElementById('chat-layout');
    const navLinks = document.querySelectorAll('#sidebar-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    const sectionTitle = document.getElementById('section-title');
    const conversationHeaderText = document.getElementById('conversation-header').querySelector('span');
    const initialConnectionButtons = document.querySelectorAll('.connection-btn-group button');
    const chatTabs = document.querySelectorAll('.chat-tab');
    const conversationsList = document.getElementById('conversations-list');
    const fullChatView = document.getElementById('full-chat-view');
    const takeOverBtn = document.getElementById('take-over-btn');
    const endConvoBtn = document.getElementById('end-convo-btn');
    const humanReplyInput = document.getElementById('human-reply-input');
    const sendHumanReplyBtn = document.getElementById('send-human-reply-btn');
    const notificationContainer = document.getElementById('notification-container');

    // Simulación de conversaciones iniciales
    simulatedConversations.whatsapp.push({
        id: 101,
        user: 'Cliente VIP',
        messages: [{
            from: 'client',
            text: '¡Hola! Necesito ayuda con mi último pedido.'
        }],
        unread: true,
        timestamp: '1:45 PM'
    });
    simulatedConversations.instagram.push({
        id: 201,
        user: 'Ana G.',
        messages: [{
            from: 'client',
            text: 'Me encantó el nuevo serum!'
        }],
        unread: false,
        timestamp: 'Ayer'
    });
    simulatedConversations.facebook.push({
        id: 301,
        user: 'Pedro R.',
        messages: [{
            from: 'client',
            text: 'Tienen un catalogo disponible?'
        }],
        unread: false,
        timestamp: '2:00 PM'
    });
    simulatedConversations.webchat.push({
        id: 401,
        user: 'Visitante Web',
        messages: [{
            from: 'client',
            text: '¿Cuáles son los métodos de pago?'
        }],
        unread: true,
        timestamp: '2:10 PM'
    });

    // --- FUNCIONES AUXILIARES ---
    function updateProgramadorContacts() {
        const targetElement = document.getElementById('target-summary');
        if (targetElement) {
            targetElement.textContent = `Objetivo actual: Mensaje Masivo a ${diffusionContacts} contactos.`;
        }
    }

    // --- FUNCIÓN PARA RENDERIZAR EL PROGRAMADOR (1) ---
    function initializeProgramadorHTML() {
        const progSection = document.getElementById('programador-section');
        if (!progSection) return;

        progSection.innerHTML = `
            <div class="programmer-grid">
                <div class="card posting-area">
                    <h2><i class="fas fa-magic"></i> Creador de Contenido Multifuncional</h2>
                    <div class="form-group upload-group">
                        <label>Fuente de Contenido (PC, Archivo Interno o Web):</label>
                        <div class="upload-options">
                            <button class="btn btn-secondary btn-icon" id="upload-file-btn"><i class="fas fa-upload"></i> Subir Archivo</button>
                            <button class="btn btn-secondary btn-icon" id="link-url-btn"><i class="fas fa-link"></i> Desde URL Web</button>
                            <input type="file" id="media-file-input" style="display: none;" accept="image/*,video/*">
                            <input type="text" id="media-url-input" placeholder="Pegar URL del Contenido" style="display: none; margin-top: 10px;">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Texto de la Publicación / Mensaje:</label>
                        <textarea id="post-text-input" placeholder="¿Qué quieres compartir hoy? Utiliza [LINK] para insertar el enlace de tu portafolio." rows="5"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Objetivo de Publicación (Multifuncional):</label>
                        <div class="publishing-options">
                            <button class="btn btn-option active" data-target="publish" id="publish-option-btn"><i class="fas fa-share-alt"></i> Redes Sociales (Orgánico)</button>
                            <button class="btn btn-option" data-target="diffusion" id="diffusion-option-btn"><i class="fas fa-users"></i> Mensaje Masivo de Difusión</button>
                        </div>
                        <p id="target-summary" style="margin-top: 10px; font-size: 0.9em; color: #555;">Objetivo actual: Publicar en los canales conectados.</p>
                    </div>
                    
                    <button class="btn btn-primary btn-lg" id="program-post-btn"><i class="fas fa-calendar-check"></i> Programar Publicación</button>
                </div>
                
                <div class="card programmer-sidebar">
                    <h2><i class="fas fa-eye"></i> Vista Previa y Boost</h2>
                    
                    <div class="preview-area" id="post-preview">
                        <p>La vista previa se cargará aquí...</p>
                    </div>

                    <div class="meta-boost-card" id="meta-boost-card" style="display: none;">
                        <h3><i class="fab fa-meta"></i> Meta Business: Optimizar Alcance</h3>
                        <p class="small-text">Conéctate a tu portafolio para convertir tu publicación en publicidad paga.</p>
                        <div class="form-group boost-option-group">
                            <input type="checkbox" id="boost-checkbox">
                            <label for="boost-checkbox">Deseo mejorar el alcance (Pago)</label>
                        </div>
                        <div id="boost-settings" style="display: none;">
                            <div class="form-group">
                                <label>Presupuesto Sugerido (USD)</label>
                                <input type="number" id="budget-input" value="10.00" min="5">
                            </div>
                            <div class="price-summary">
                                <strong>Cobro Estimado a Tarjeta:</strong> <span id="boost-price">$10.00 USD</span>
                            </div>
                            <button class="btn btn-success btn-sm" id="send-to-meta-btn"><i class="fas fa-rocket"></i> Enviar a Meta Business</button>
                        </div>
                    </div>
                    <div class="card content-library" style="margin-top: 20px;">
                        <h2><i class="fas fa-photo-video"></i> Biblioteca</h2>
                        <div id="content-library"></div>
                    </div>
                </div>
            </div>
        `;
        
        attachProgramadorListeners();
    }
    
    // Función para manejar toda la lógica del Programador (1)
    function attachProgramadorListeners() {
        // --- Lógica de subida de contenido ---
        const uploadFileBtn = document.getElementById('upload-file-btn');
        const linkUrlBtn = document.getElementById('link-url-btn');
        const mediaFileInput = document.getElementById('media-file-input');
        const mediaUrlInput = document.getElementById('media-url-input');
        const postTextInput = document.getElementById('post-text-input');
        const postPreview = document.getElementById('post-preview');
        
        uploadFileBtn.addEventListener('click', () => { mediaFileInput.click(); });
        linkUrlBtn.addEventListener('click', () => { mediaUrlInput.style.display = 'block'; });

        // Simulamos la carga en el preview
        function updatePreview(text, media) {
            let html = `<p>${text || 'La vista previa del texto aparecerá aquí...'}</p>`;
            if (media) {
                html += `<img src="${media}" style="width:100%; margin-top:10px; border-radius: 4px;">`;
            }
            postPreview.innerHTML = html;
        }

        postTextInput.addEventListener('input', () => updatePreview(postTextInput.value, mediaUrlInput.value || (mediaFileInput.files.length > 0 ? URL.createObjectURL(mediaFileInput.files[0]) : null)));
        mediaUrlInput.addEventListener('input', () => updatePreview(postTextInput.value, mediaUrlInput.value));
        mediaFileInput.addEventListener('change', () => updatePreview(postTextInput.value, URL.createObjectURL(mediaFileInput.files[0])));

        // --- Lógica de Meta Business Boost ---
        const boostCheckbox = document.getElementById('boost-checkbox');
        const boostSettings = document.getElementById('boost-settings');
        const metaBoostCard = document.getElementById('meta-boost-card');
        const budgetInput = document.getElementById('budget-input');
        const boostPrice = document.getElementById('boost-price');

        // Solo mostramos la tarjeta si hay canales de Meta conectados
        if (connectionStatus.instagram || connectionStatus.facebook) {
            metaBoostCard.style.display = 'block';
        }

        boostCheckbox.addEventListener('change', () => {
            boostSettings.style.display = boostCheckbox.checked ? 'block' : 'none';
        });

        budgetInput.addEventListener('input', () => {
            const budget = parseFloat(budgetInput.value) || 0;
            boostPrice.textContent = `$${budget.toFixed(2)} USD`;
        });
        
        document.getElementById('send-to-meta-btn')?.addEventListener('click', () => {
            alert(`¡Solicitud enviada a Meta Business! Presupuesto: $${budgetInput.value} USD. Se enviará la información a su Portafolio Laboral de Meta para el cobro y optimización.`);
        });

        // --- Lógica de Publicación / Difusión ---
        const publishOptionBtn = document.getElementById('publish-option-btn');
        const diffusionOptionBtn = document.getElementById('diffusion-option-btn');
        const targetSummary = document.getElementById('target-summary');
        
        function updateTargetOptions(target) {
            document.querySelectorAll('.btn-option').forEach(btn => btn.classList.remove('active'));
            if (target === 'publish') {
                publishOptionBtn.classList.add('active');
                targetSummary.textContent = 'Objetivo actual: Publicar en los canales conectados (Publicidad Orgánica).';
                metaBoostCard.style.display = (connectionStatus.instagram || connectionStatus.facebook) ? 'block' : 'none';
            } else { // diffusion
                diffusionOptionBtn.classList.add('active');
                targetSummary.textContent = `Objetivo actual: Mensaje Masivo a ${diffusionContacts} contactos de difusión.`;
                metaBoostCard.style.display = 'none'; // No se puede impulsar la difusión masiva en Meta
            }
        }
        
        publishOptionBtn.addEventListener('click', () => updateTargetOptions('publish'));
        diffusionOptionBtn.addEventListener('click', () => {
             if (diffusionContacts === 0) {
                 alert("No tienes contactos en tu lista de difusión. Súbelos desde Configuración > Difusión & Contactos.");
                 return;
             }
             updateTargetOptions('diffusion');
        });
        
        document.getElementById('program-post-btn')?.addEventListener('click', () => {
            const target = document.querySelector('.btn-option.active').dataset.target;
            const boost = boostCheckbox.checked && target === 'publish' ? `(Con impulso de $${budgetInput.value} USD)` : '(Orgánica)';
            
            if (target === 'publish') {
                alert(`¡Publicación Programada! Se publicará en las redes sociales conectadas ${boost}.`);
            } else {
                alert(`¡Mensaje Masivo Programado! Se enviará a ${diffusionContacts} contactos por WhatsApp/Webchat.`);
            }
        });

        // Simulación de la biblioteca de contenido (igual que antes)
        const contentLibrary = document.getElementById('content-library');
        const staticContent = [
            { title: "¡Nuevo Sérum!", text: "¡Piel radiante al instante! ✨...", img: "https://static.vecteezy.com/system/resources/thumbnails/023/460/371/small/blue-cosmetic-serum-background-illustration-ai-generative-free-photo.jpg" },
            { title: "Promo Labiales", text: "💋 ¡Jueves de Labiales! 💋...", img: "data:image/jpeg;base64,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" }
        ];

        contentLibrary.innerHTML = '';
        staticContent.forEach(item => {
            const div = document.createElement('div');
            div.className = 'library-item';
            div.innerHTML = `<img src="${item.img}" alt="${item.title}" style="width:100%; margin-top:5px; border-radius: 4px;"><b>${item.title}</b><p style="font-size: 0.85em; color: #666;">${item.text}</p><button class="btn btn-primary" style="width:100%; margin-top:5px;">Usar esta plantilla</button>`;
            div.querySelector('button').addEventListener('click', () => {
                postTextInput.value = item.text;
                updatePreview(postTextInput.value, item.img);
            });
            contentLibrary.appendChild(div);
        });
        
    }
    
    // --- OTRAS FUNCIONES DE INICIALIZACIÓN ---
    function initializeSectionsHTML() {
        initializeProgramadorHTML(); // Usa la nueva función (1)
        
        const statsSection = document.getElementById('estadisticas-section');
        if (statsSection) statsSection.innerHTML = `
            <div class="card">
                <h2><i class="fas fa-chart-bar"></i> Resumen Ejecutivo de Guapas</h2>
                <div class="stats-kpi-grid" id="stats-kpi-grid">
                    </div>
            </div>
            <div class="stats-chart-grid">
                <div class="chart-container">
                    <h2><i class="fas fa-chart-area"></i> Interacciones por Canal (Últimos 7 Días)</h2>
                    <canvas id="trafficChart" height="150"></canvas>
                </div>
                <div class="chart-container">
                    <h2><i class="fas fa-percent"></i> Distribución de Mensajes</h2>
                    <canvas id="channelDistributionChart" height="250"></canvas>
                </div>
            </div>
        `;
        
        const configSection = document.getElementById('configuracion-section');
        if (configSection) configSection.innerHTML = `
            <div class="card">
                <h2><i class="fas fa-cog"></i> Centro de Control y Optimización</h2>
                <div class="config-tabs" id="config-tabs">
                    <div class="config-tab active" data-tab="api"><i class="fas fa-key"></i> Conexiones & APIs</div>
                    <div class="config-tab" data-tab="profile"><i class="fas fa-store"></i> Perfil & IA</div>
                    <div class="config-tab" data-tab="diffusion"><i class="fas fa-users"></i> Difusión & Contactos</div>
                    <div class="config-tab" data-tab="general"><i class="fas fa-wrench"></i> Control General</div>
                </div>
                <div class="config-content-panel" id="config-content-panel">
                    </div>
            </div>
        `;
        setupDynamicContent();
    }
    
    function renderStatistics() {
        const kpiGrid = document.getElementById('stats-kpi-grid');
        if (!kpiGrid) return;

        const statsData = {
            totalMessages: 0,
            humanInterventions: 0,
            postsReached: 0,
            responseRate: '0%',
            channelData: {
                whatsapp: 0,
                instagram: 0,
                facebook: 0,
                webchat: 0
            }
        };

        Object.keys(simulatedConversations).forEach(channel => {
            if (connectionStatus[channel]) {
                const count = simulatedConversations[channel].reduce((sum, convo) => sum + convo.messages.length, 0);
                statsData.totalMessages += count;
                statsData.channelData[channel] = count;
            }
        });

        statsData.humanInterventions = Math.floor(statsData.totalMessages * 0.1);
        statsData.postsReached = Math.floor(statsData.totalMessages * 5); 
        statsData.responseRate = statsData.totalMessages > 0 ? '98%' : '0%';
        
        const kpis = [
            { label: 'Mensajes Totales', value: statsData.totalMessages, icon: 'fas fa-comments', color: 'var(--info-color)' },
            { label: 'Intervenciones Humanas', value: statsData.humanInterventions, icon: 'fas fa-user-headset', color: 'var(--human-color)' },
            { label: 'Tasa de Respuesta', value: statsData.responseRate, icon: 'fas fa-reply-all', color: 'var(--success-color)' },
            { label: 'Alcance de Publicaciones', value: statsData.postsReached, icon: 'fas fa-bullhorn', color: 'var(--accent-color)' }
        ];

        kpiGrid.innerHTML = kpis.map(kpi => `
            <div class="kpi-card" style="border-left-color: ${kpi.color};">
                <div>
                    <div class="kpi-value">${kpi.value}</div>
                    <div class="kpi-label">${kpi.label}</div>
                </div>
                <div class="kpi-icon"><i class="${kpi.icon}"></i></div>
            </div>
        `).join('');

        document.getElementById('trafficChart')?.remove();
        document.getElementById('channelDistributionChart')?.remove();
        document.querySelector('.stats-chart-grid .chart-container:nth-child(1)').innerHTML = '<h2><i class="fas fa-chart-area"></i> Interacciones por Canal (Últimos 7 Días)</h2><canvas id="trafficChart" height="150"></canvas>';
        document.querySelector('.stats-chart-grid .chart-container:nth-child(2)').innerHTML = '<h2><i class="fas fa-percent"></i> Distribución de Mensajes</h2><canvas id="channelDistributionChart" height="250"></canvas>';
        
        const trafficCtx = document.getElementById('trafficChart')?.getContext('2d');
        if (trafficCtx) {
            new Chart(trafficCtx, {
                type: 'bar',
                data: {
                    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                    datasets: [{
                        label: 'Interacciones',
                        data: [
                            statsData.totalMessages / 7, 
                            statsData.totalMessages / 7, 
                            statsData.totalMessages / 7, 
                            statsData.totalMessages / 7, 
                            statsData.totalMessages / 7, 
                            statsData.totalMessages / 7, 
                            statsData.totalMessages / 7
                        ].map(val => Math.ceil(val)),
                        backgroundColor: 'rgba(212, 175, 55, 0.7)',
                        borderColor: 'var(--accent-color)',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } },
                    plugins: { legend: { display: false } }
                }
            });
        }

        const distributionCtx = document.getElementById('channelDistributionChart')?.getContext('2d');
        if (distributionCtx) {
            new Chart(distributionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['WhatsApp', 'Instagram', 'Facebook', 'Web Chat'],
                    datasets: [{
                        label: 'Mensajes',
                        data: [
                            statsData.channelData.whatsapp, 
                            statsData.channelData.instagram, 
                            statsData.channelData.facebook, 
                            statsData.channelData.webchat
                        ],
                        backgroundColor: [
                            'var(--whatsapp-color)',
                            'var(--instagram-color)',
                            'var(--facebook-color)',
                            'var(--info-color)'
                        ],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }
    }
    
    function attachConfigListeners() {
        document.querySelectorAll('.config-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.config-tab').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                activeConfigTab = e.currentTarget.dataset.tab;
                renderConfigSection();
            });
        });
        
        const addKnowledgeBtn = document.getElementById('add-knowledge-btn');
        if (addKnowledgeBtn) {
            addKnowledgeBtn.addEventListener('click', () => {
                const trigger = document.getElementById('ai-trigger-input').value.trim();
                const response = document.getElementById('ai-response-input').value.trim();
                if (trigger && response) {
                    knowledgeBase.push({ id: Date.now(), trigger, response });
                    renderConfigSection(); 
                    alert(`¡IA educada! Nueva respuesta guardada para: ${trigger}`);
                } else {
                    alert('Debe ingresar una palabra clave y una respuesta para educar a la IA.');
                }
            });
            document.querySelectorAll('.delete-knowledge-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.dataset.id);
                    knowledgeBase = knowledgeBase.filter(item => item.id !== id);
                    renderConfigSection();
                });
            });
        }
        
        const uploadContactsBtn = document.getElementById('upload-contacts-btn');
        if (uploadContactsBtn) {
            uploadContactsBtn.addEventListener('click', () => {
                const fileInput = document.getElementById('contact-file');
                if (fileInput.files.length > 0) {
                    const simulatedCount = 50 + Math.floor(Math.random() * 200);
                    diffusionContacts = simulatedCount;
                    // Actualiza el Programador
                    const targetSummary = document.getElementById('target-summary');
                    if (targetSummary && document.getElementById('diffusion-option-btn').classList.contains('active')) {
                         targetSummary.textContent = `Objetivo actual: Mensaje Masivo a ${diffusionContacts} contactos.`;
                    }
                    document.getElementById('current-diffusion-count').textContent = diffusionContacts;
                    alert(`¡Lista subida con éxito! Se añadieron ${simulatedCount} contactos a la lista de difusión, visible en el Programador.`);
                } else {
                    alert('Por favor, seleccione un archivo CSV o TXT para subir.');
                }
            });
        }
    }
    
    function renderConfigSection() {
        const panel = document.getElementById('config-content-panel');
        if (!panel) return;

        let html = '';

        switch (activeConfigTab) {
            case 'api':
                html = `
                    <div class="grid-2-col">
                        <div class="card">
                            <h3><i class="fab fa-facebook-f"></i> Conexión Meta Apps (API)</h3>
                            <p style="font-size: 0.9em; color: #666; margin-bottom: 15px;">Administre las claves para WhatsApp Business API, Instagram y Facebook Messenger.</p>
                            <div class="form-group">
                                <label>Meta App ID</label>
                                <input type="text" value="APP_ID_GUAPAS_001" readonly>
                            </div>
                            <div class="form-group">
                                <label>Token WhatsApp API (Phone Number ID)</label>
                                <div class="api-token-view">
                                    <input type="text" value="****************************************" readonly>
                                    <button class="btn btn-primary btn-sm"><i class="fas fa-copy"></i></button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Token de Acceso de Instagram/Facebook</label>
                                <div class="api-token-view">
                                    <input type="text" value="****************************************" readonly>
                                    <button class="btn btn-primary btn-sm"><i class="fas fa-copy"></i></button>
                                </div>
                            </div>
                            <button class="btn btn-primary" style="margin-top: 10px;">Guardar Tokens</button>
                        </div>
                        <div class="card">
                            <h3><i class="fas fa-plug"></i> Canales Adicionales</h3>
                            <p style="font-size: 0.9em; color: #666; margin-bottom: 15px;">Configure conexiones secundarias (Telegram, Email, etc).</p>
                            <div class="connection-card" style="margin-bottom: 15px; border-left: 3px solid var(--info-color);">
                                <h4 style="margin-bottom: 10px;"><i class="fab fa-telegram-plane"></i> Telegram Bot</h4>
                                <div class="form-group" style="padding: 0; border: none;">
                                    <label>Token del Bot</label>
                                    <input type="text" placeholder="Ingrese el token aquí">
                                </div>
                                <button class="btn btn-primary">Conectar Telegram</button>
                            </div>
                            <div class="connection-card" style="border-left: 3px solid #888;">
                                <h4 style="margin-bottom: 10px;"><i class="fas fa-envelope"></i> Email de Soporte</h4>
                                <div class="form-group" style="padding: 0; border: none;">
                                    <label>Email (IMAP/SMTP)</label>
                                    <input type="text" value="soporte@guapascosmeticos.com">
                                </div>
                                <button class="btn btn-primary">Configurar</button>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'profile':
                html = `
                    <div class="grid-2-col">
                        <div class="card">
                            <h3><i class="fas fa-store"></i> Perfil de Negocio</h3>
                            <div class="form-group">
                                <label>Nombre del Negocio</label>
                                <input type="text" value="Guapas Cosmeticos">
                            </div>
                            <div class="form-group">
                                <label>Descripción Corta / Lema</label>
                                <input type="text" value="Productos de belleza de alta calidad para la mujer moderna.">
                            </div>
                            <div class="form-group">
                                <label>Logo / Imagen de Perfil</label>
                                <input type="text" value="https://www.youtube.com/watch?v=1T-9eM0vzeg">
                            </div>
                            <button class="btn btn-primary">Guardar Perfil</button>
                        </div>
                        <div class="card">
                            <h3><i class="fas fa-brain"></i> Entrenamiento de la IA (Knowledge Base)</h3>
                            <p style="font-size: 0.9em; color: #666; margin-bottom: 15px;">Eduque a la IA con respuestas predeterminadas para mejorar su precisión.</p>
                            <div class="ai-editor-area">
                                <h4><i class="fas fa-plus-circle"></i> Nueva Regla de Respuesta</h4>
                                <div class="form-group" style="padding: 0; border: none;">
                                    <label>Palabra/Frase Clave (Trigger)</label>
                                    <input type="text" id="ai-trigger-input" placeholder="Ej: horario, catalogo, garantia">
                                </div>
                                <div class="form-group" style="padding: 0; border: none;">
                                    <label>Mensaje de Respuesta de la IA</label>
                                    <textarea id="ai-response-input" rows="3" placeholder="Ej: Nuestro horario es de 9:00 AM a 5:00 PM."></textarea>
                                </div>
                                <button class="btn btn-primary" id="add-knowledge-btn"><i class="fas fa-save"></i> Crear Respuesta</button>
                            </div>
                            <h4 style="margin-top: 20px;"><i class="fas fa-list"></i> Respuestas Guardadas:</h4>
                            <ul class="knowledge-list" id="knowledge-list">
                                ${knowledgeBase.map(item => `
                                    <li class="knowledge-item">
                                        <span><strong>${item.trigger}</strong>: ${item.response.substring(0, 40)}...</span>
                                        <button class="btn btn-destructive-outline btn-sm delete-knowledge-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                `;
                break;
            case 'diffusion':
                html = `
                    <div class="card">
                        <h3><i class="fas fa-upload"></i> Carga de Listas de Contactos para Difusión</h3>
                        <p style="font-size: 0.9em; color: #666; margin-bottom: 15px;">Sube un archivo CSV o TXT (una línea por número/contacto) para campañas de difusión.</p>
                        <div class="form-group">
                            <label for="contact-file"><i class="fas fa-file-upload"></i> Seleccionar Archivo (.csv/.txt)</label>
                            <input type="file" id="contact-file" accept=".csv, .txt" style="display: block; margin-top: 5px;">
                        </div>
                        <button class="btn btn-primary" id="upload-contacts-btn" style="margin-bottom: 20px;"><i class="fas fa-cloud-upload-alt"></i> Procesar y Guardar Lista</button>
                        
                        <h4><i class="fas fa-info-circle"></i> Resumen de Listas</h4>
                        <p>Total de contactos listos para difusión: <strong id="current-diffusion-count">${diffusionContacts}</strong></p>
                        <ul style="list-style: disc; margin-left: 20px; font-size: 0.9em; color: #444; margin-top: 10px;">
                            <li>Lista "Clientes VIP" (Simulado): 500 contactos</li>
                            <li>Lista "Interesados Noviembre": ${diffusionContacts > 0 ? diffusionContacts : 0} contactos</li>
                        </ul>
                    </div>
                `;
                break;
            case 'general':
                html = `
                    <div class="grid-2-col">
                        <div class="card">
                            <h3><i class="fas fa-cogs"></i> Control de Rendimiento</h3>
                            <p style="font-size: 0.9em; color: #666; margin-bottom: 15px;">Ajustes de optimización del sistema.</p>
                            <div class="form-group">
                                <label>Optimización de Carga (Actual)</label>
                                <p style="color: var(--success-color); font-weight: 600;">Modo: Máxima Eficiencia (Código Modularizado)</p>
                            </div>
                            <div class="form-group">
                                <label>Frecuencia de Actualización de Estadísticas</label>
                                <input type="text" value="10 minutos">
                            </div>
                            <button class="btn btn-primary">Aplicar Cambios</button>
                        </div>
                        <div class="card">
                            <h3><i class="fas fa-shield-alt"></i> Seguridad y Acceso</h3>
                            <div class="form-group">
                                <label>Autenticación de Dos Factores</label>
                                <p style="color: var(--success-color); font-weight: 600;">Activada</p>
                            </div>
                             <div class="form-group">
                                <label>Restablecer Sistema</label>
                                <button class="btn btn-destructive-outline" onclick="alert('Sistema en modo de prueba, no se puede restablecer. ¡Cuidado, socio!');">Borrar Todos los Datos</button>
                            </div>
                        </div>
                    </div>
                `;
                break;
        }

        panel.innerHTML = html;
        attachConfigListeners();
    }
    
    function setupDynamicContent() {
         document.querySelectorAll('.config-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.config-tab').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                activeConfigTab = e.currentTarget.dataset.tab;
                renderConfigSection();
            });
        });
        renderConfigSection();
    }


    // --- LÓGICA DE CONEXIÓN DEL DASHBOARD (2) ---
    function updateConnectionStatus(platform, isConnected) {
        connectionStatus[platform] = isConnected;
        const card = document.getElementById(`${platform}-card`);
        if (!card) return;
        
        const btnGroup = card.querySelector('.connection-btn-group');
        let button = btnGroup.querySelector('.btn-connect');
        
        // Limpiar listeners antiguos
        button?.parentNode.removeChild(button);

        card.querySelector('.status').className = `status ${isConnected ? 'connected' : 'disconnected'}`;
        card.querySelector('.status').innerHTML = `<span class="status-dot"></span><span>${isConnected ? 'Conectado' : 'Desconectado'}</span>`;
        
        if (platform === 'whatsapp') {
            card.querySelector('#whatsapp-default-name').classList.toggle('hidden', isConnected);
            card.querySelector('#whatsapp-verified-view').classList.toggle('hidden', !isConnected);
        } else {
            const title = card.querySelector('.account-info');
            if (title) title.textContent = isConnected ? accountNames[platform] : title.dataset.defaultName;
        }

        // Crear el nuevo botón según el estado (2)
        button = document.createElement('button');
        button.dataset.platform = platform;
        
        if (isConnected) {
            button.className = 'btn btn-connect btn-disconnect';
            button.textContent = 'Desconectar';
            button.addEventListener('click', disconnectHandler);
            
            // Si conectamos Facebook/Instagram, actualizamos el Programador
            if (platform === 'instagram' || platform === 'facebook') {
                const metaBoostCard = document.getElementById('meta-boost-card');
                if (metaBoostCard) metaBoostCard.style.display = 'block';
            }
            
        } else {
            button.className = 'btn btn-connect connect';
            button.textContent = 'Conectar';
            button.addEventListener('click', connectHandler);
            
            // Si desconectamos Facebook/Instagram, ocultamos el Boost
            if (platform === 'instagram' || platform === 'facebook') {
                if (!connectionStatus.instagram && !connectionStatus.facebook) {
                    const metaBoostCard = document.getElementById('meta-boost-card');
                    if (metaBoostCard) metaBoostCard.style.display = 'none';
                }
            }
        }
        btnGroup.appendChild(button);

        if (isConnected) {
            const activeTab = document.querySelector('.chat-tab.active');
            if (activeTab) renderConversations(activeTab.dataset.channel);
            renderStatistics();
        }
    }
    
    function connectHandler(e) {
        const platform = e.target.dataset.platform;
        alert(`Simulando conexión con ${platform}...`);
        setTimeout(() => updateConnectionStatus(platform, true), 1000);
    }
    
    function disconnectHandler(e) {
        const platform = e.target.dataset.platform;
        alert(`Desconectando ${platform}...`);
        setTimeout(() => updateConnectionStatus(platform, false), 1000);
    }

    // Inicializar listeners para los botones de conexión
    initialConnectionButtons.forEach(button => button.addEventListener('click', connectHandler));
    

    // --- LÓGICA GENERAL ---
    
    initializeSectionsHTML();

    hamburgerMenu.addEventListener('click', () => sidebar.classList.toggle('visible'));

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            const targetSection = document.getElementById(`${sectionId}-section`);
            if (!targetSection) return;
            contentSections.forEach(s => s.style.display = 'none');
            targetSection.style.display = 'block';
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const titleText = link.innerText.trim();
            sectionTitle.textContent = titleText === 'Dashboard' ? 'Centro de Conexiones' : titleText;
            if (window.innerWidth < 768) sidebar.classList.remove('visible');
            
            if (sectionId === 'estadisticas') { 
                 renderStatistics();
            } else if (sectionId === 'configuracion') {
                 renderConfigSection(); 
            } else if (sectionId === 'programador') {
                 initializeProgramadorHTML(); // Re-renderiza para actualizar el estado de Meta Boost
            }
        });
    });

    function renderWelcomeScreen() {
        fullChatView.innerHTML = `
            <div id="chat-welcome-screen">
                <i class="fas fa-comments"></i>
                <h3>Panel de Mensajería</h3>
                <p>Selecciona una conversación de la lista para ver los mensajes.</p>
            </div>
        `;
    }

    function renderConversations(channelFilter = 'all') {
        conversationsList.innerHTML = '';
        const channelsToRender = channelFilter === 'all' ? Object.keys(simulatedConversations) : [channelFilter];
        let conversationsFound = false;
        channelsToRender.forEach(ch => {
            if (connectionStatus[ch]) {
                if (simulatedConversations[ch].length > 0) conversationsFound = true;
                simulatedConversations[ch].forEach(convo => {
                    const item = document.createElement('div');
                    item.className = 'convo-item';
                    item.dataset.channel = ch;
                    item.dataset.convoId = convo.id;
                    const lastMessage = convo.messages[convo.messages.length - 1];
                    const channelIcon = ch === 'webchat' ? 'globe' : ch;
                    item.innerHTML = `
                        <div class="convo-item-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <strong style="font-size: 0.95em;">${convo.user}</strong>
                            <i class="fab fa-${channelIcon}" style="color: var(--${ch}-color);"></i>
                        </div>
                        <p class="convo-item-preview" style="font-size: 0.85em; color: #666;">${lastMessage.text.substring(0, 40)}...</p>`;
                    if (convo.id === activeConversationId) item.classList.add('active');
                    item.addEventListener('click', () => displayConversation(ch, convo.id));
                    conversationsList.appendChild(item);
                });
            }
        });
        if (!conversationsFound) {
            conversationsList.innerHTML = '<p style="text-align:center; color:#999; padding: 20px;">No hay conversaciones activas.</p>';
        }
    }

    function displayConversation(channel, convoId) {
        activeConversationId = convoId;
        activeChannel = channel;
        const conversation = simulatedConversations[channel].find(c => c.id === convoId);
        if (!conversation) return;
        document.querySelectorAll('.convo-item').forEach(item => item.classList.remove('active'));
        const activeItem = document.querySelector(`.convo-item[data-convo-id='${convoId}']`);
        if (activeItem) activeItem.classList.add('active');
        conversationHeaderText.textContent = `Conversación con ${conversation.user}`;
        fullChatView.innerHTML = '<div class="chat-container"></div>';
        conversation.messages.forEach(msg => addBubbleToChat(msg.from, msg.text));
        humanReplyInput.disabled = true;
        takeOverBtn.disabled = false;
        sendHumanReplyBtn.disabled = true;
        endConvoBtn.disabled = false;
        humanReplyInput.value = '';
        if (window.innerWidth < 768) chatLayout.classList.add('show-conversation');
    }

    function addBubbleToChat(from, text) {
        const container = fullChatView.querySelector('.chat-container');
        if (!container) return;
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${from}`;
        bubble.textContent = text;
        container.appendChild(bubble);
        fullChatView.scrollTop = fullChatView.scrollHeight;
    }

    chatTabs.forEach(tab => tab.addEventListener('click', () => {
        chatTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderConversations(tab.dataset.channel);
    }));

    takeOverBtn.addEventListener('click', () => {
        if (!activeConversationId) {
            alert('Seleccione una conversación primero.');
            return;
        }
        humanReplyInput.disabled = false;
        sendHumanReplyBtn.disabled = false;
        takeOverBtn.disabled = true;
        humanReplyInput.focus();
        const interventionMessage = {
            from: 'ia',
            text: 'Un asesor se ha unido al chat.'
        };
        simulatedConversations[activeChannel].find(c => c.id === activeConversationId).messages.push(interventionMessage);
        addBubbleToChat(interventionMessage.from, interventionMessage.text);
    });

    function sendHumanMessage() {
        const text = humanReplyInput.value.trim();
        if (text && activeConversationId && !humanReplyInput.disabled) {
            simulatedConversations[activeChannel].find(c => c.id === activeConversationId).messages.push({
                from: 'human',
                text
            });
            addBubbleToChat('human', text);
            humanReplyInput.value = '';
            renderConversations(document.querySelector('.chat-tab.active').dataset.channel);
            renderStatistics(); 
        }
    }
    sendHumanReplyBtn.addEventListener('click', sendHumanMessage);
    humanReplyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendHumanMessage();
    });

    endConvoBtn.addEventListener('click', () => {
        if (!activeConversationId) {
            alert('Seleccione una conversación primero.');
            return;
        }
        addBubbleToChat('ia', '--- Conversación Finalizada ---');
        humanReplyInput.disabled = true;
        takeOverBtn.disabled = true;
        sendHumanReplyBtn.disabled = true;
        endConvoBtn.disabled = true;
        const convoItem = document.querySelector(`.convo-item[data-convo-id='${activeConversationId}']`);
        if (convoItem) convoItem.style.opacity = '0.5';
        activeConversationId = null;
        activeChannel = null;
        conversationHeaderText.textContent = 'Seleccione una conversación';
        renderWelcomeScreen();
    });

    function showNotification(channel, convoId, user, message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.dataset.channel = channel;
        toast.dataset.convoId = convoId;
        const channelIcon = channel === 'webchat' ? 'globe' : channel;
        const channelColor = `var(--${channel}-color)`;
        toast.innerHTML = `
            <div class="toast-icon" style="color: ${channelColor};"><i class="fab fa-${channelIcon}"></i></div>
            <div class="toast-body">
                <strong>Nuevo mensaje de ${user}</strong>
                <p>${message.substring(0, 50)}...</p>
            </div>
            <button class="toast-close">&times;</button>
        `;
        notificationContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        const autoCloseTimeout = setTimeout(() => {
            closeNotification(toast);
        }, 8000);
        toast.querySelector('.toast-close').addEventListener('click', (e) => {
            e.stopPropagation();
            clearTimeout(autoCloseTimeout);
            closeNotification(toast);
        });
        toast.addEventListener('click', () => {
            handleNotificationClick(toast);
            clearTimeout(autoCloseTimeout);
            closeNotification(toast);
        });
    }

    function closeNotification(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }

    function handleNotificationClick(toast) {
        const channel = toast.dataset.channel;
        const convoId = parseInt(toast.dataset.convoId);
        if (!channel || isNaN(convoId)) return;
        document.querySelector('#sidebar-nav a[data-section="mensajes"]').click();
        document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
        const allTab = document.querySelector('.chat-tab[data-channel="all"]');
        if (allTab) {
            allTab.classList.add('active');
            renderConversations('all');
        }
        displayConversation(channel, convoId);
    }
    
    // Simulación de nuevos mensajes entrantes
    setInterval(() => {
        const connectedChannels = Object.keys(connectionStatus).filter(ch => connectionStatus[ch]);
        if (connectedChannels.length === 0) return;
        const randomChannel = connectedChannels[Math.floor(Math.random() * connectedChannels.length)];
        const newConvoId = Date.now();
        const newUser = `Cliente-${Math.floor(1000 + Math.random() * 9000)}`;
        const newMessageText = "¡Hola! Quisiera más información sobre sus productos.";
        const newConversation = {
            id: newConvoId,
            user: newUser,
            messages: [{
                    from: 'client',
                    text: newMessageText
                },
                {
                    from: 'ia',
                    text: '¡Hola! ✨ Gracias por contactar a Guapas Cosméticos. En breve un asesor te atenderá.'
                }
            ]
        };
        simulatedConversations[randomChannel].unshift(newConversation);
        const activeTabFilter = document.querySelector('.chat-tab.active')?.dataset.channel;
        if (activeTabFilter === 'all' || activeTabFilter === randomChannel) {
            renderConversations(activeTabFilter);
        }
        showNotification(randomChannel, newConvoId, newUser, newMessageText);
        renderStatistics(); 
    }, 12000);

    // Estado inicial de la aplicación
    renderConversations('all');
    renderWelcomeScreen();
    renderConfigSection(); 
    updateProgramadorContacts();
});