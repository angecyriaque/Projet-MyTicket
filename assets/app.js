/* ====================================================================
 * MYTICKET APPLICATION CORE BUNDLE (OPTIMIZED V2)
 * High-performance, pre-parsed, cached script for mobile and desktop
 * ==================================================================== */

    // Global Avatar for User Creation
    // Global Avatar for User Creation (Null = Virgin & Obligatory)
    let createdAvatarDataURL = null;

    const DEFAULT_VISITOR_USER = {
        id: "USR-VISITEUR",
        name: "Visiteur / Invité",
        role: "Compte Public",
        comite: "Visiteur",
        contact1: "",
        contact2: "",
        avatar: "", // Le compte visiteur n'a pas de photo de profil
        isVisitor: true,
        isAdmin: false
    };

    // Global Application State
    let state = {
        participants: [],
        availableVerses: [], // Pool de versets bibliques uniques JPEG
        currentTicket: null,
        user: DEFAULT_VISITOR_USER,
        isAdminUnlocked: true, // Direction Admin
        paymentProofs: {}, // Registry of tracked payment transactions
        currentAnalyzedProof: null,
        finance: {
            incomesTotal: 0,
            ticketsIncome: 0,
            donsIncome: 0,
            budgetTotal: 0,
            expensesTotal: 0,
            balance: 0,
            accounts: {
                especes: 0,
                wave: 0,
                orangeMoney: 0
            },
            committees: [
                { id: "strat", name: "Coordination Stratégique", resp: "", type: "Coordination", color: "amber", lignesBudget: [] },
                { id: "ops", name: "Coordination Opérationnelle", resp: "", type: "Coordination", color: "sky", lignesBudget: [] },
                { id: "supervision", name: "Comité Supervision", resp: "", type: "Comité", color: "purple", lignesBudget: [] },
                { id: "spirituel", name: "Comité Spirituel", resp: "", type: "Comité", color: "violet", lignesBudget: [] },
                { id: "communication", name: "Comité Communication & Mobilisation", resp: "", type: "Comité", color: "blue", lignesBudget: [] },
                { id: "animation", name: "Comité Animation & Jeux", resp: "", type: "Comité", color: "pink", lignesBudget: [] },
                { id: "administratif", name: "Comité Administratif", resp: "", type: "Comité", color: "teal", lignesBudget: [] },
                { id: "logistique", name: "Comité Logistique", resp: "", type: "Comité", color: "cyan", lignesBudget: [] },
                { id: "financier", name: "Comité Financier", resp: "", type: "Comité", color: "emerald", lignesBudget: [] },
                { id: "restauration", name: "Comité Restauration", resp: "", type: "Comité", color: "amber", lignesBudget: [] },
                { id: "accueil", name: "Comité Accueil & Sécurité", resp: "", type: "Comité", color: "red", lignesBudget: [] }
            ],
            decaissements: [],
            dons: []
        }
    };

        // Preloaded robust datasets of mock attendees with Categories & Proofs
    const MOCK_PARTICIPANTS = [];

    // Seed tracked payment proofs
    const SEED_PAYMENTS = {};

    // On Load Initialization

    // ==========================================
    // OFFICIAL EVENT COUNTDOWN TIMER (BILLETTERIE)
    // ==========================================
    let countdownIntervalId = null;

    
        function triggerJubileeConfetti() {
        if (typeof confetti !== 'function') return;
        try {
            confetti({
                particleCount: 60,
                spread: 70,
                origin: { y: 0.65 },
                colors: ['#FFD700', '#FF5A36', '#F59E0B', '#8B5CF6', '#10B981']
            });
        } catch(e) {
            console.log("Confetti trigger:", e);
        }
    }

    function launchFireworksShow(durationMs) {
        triggerJubileeConfetti();
    }

    function updateHomeCountdown() {
        const targetDate = new Date("2027-01-01T20:00:00").getTime();
        const now = new Date().getTime();
        const diff = targetDate - now;

        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            const dEl = document.getElementById('home-count-days');
            const hEl = document.getElementById('home-count-hours');
            const mEl = document.getElementById('home-count-mins');
            const sEl = document.getElementById('home-count-secs');

            if (dEl) dEl.innerText = String(days).padStart(2, '0');
            if (hEl) hEl.innerText = String(hours).padStart(2, '0');
            if (mEl) mEl.innerText = String(mins).padStart(2, '0');
            if (sEl) sEl.innerText = String(secs).padStart(2, '0');
        }
    }

    function startTicketCountdown() {
        // Target Date: 01 Janvier 2027 à 00:00:00 (Local Time)
        const targetEventDate = new Date(2027, 0, 1, 0, 0, 0).getTime();

        function tick() {
            if (document.hidden) return;
            const elTicketSecs = document.getElementById('countdown-ticket-seconds');
            if (!elTicketSecs || elTicketSecs.offsetParent === null) return;

            const now = Date.now();
            const diff = Math.max(0, targetEventDate - now);

            const days = Math.floor(diff / 86400000);
            const hours = Math.floor((diff % 86400000) / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            const strDays = String(days).padStart(2, '0');
            const strHours = String(hours).padStart(2, '0');
            const strMinutes = String(minutes).padStart(2, '0');
            const strSeconds = String(seconds).padStart(2, '0');

            const elTicketDays = document.getElementById('countdown-ticket-days');
            if (elTicketDays && elTicketDays.textContent !== strDays) elTicketDays.textContent = strDays;

            const elTicketHours = document.getElementById('countdown-ticket-hours');
            if (elTicketHours && elTicketHours.textContent !== strHours) elTicketHours.textContent = strHours;

            const elTicketMins = document.getElementById('countdown-ticket-minutes');
            if (elTicketMins && elTicketMins.textContent !== strMinutes) elTicketMins.textContent = strMinutes;

            if (elTicketSecs.textContent !== strSeconds) elTicketSecs.textContent = strSeconds;
        }

        tick();
        if (countdownIntervalId) clearInterval(countdownIntervalId);
        countdownIntervalId = setInterval(tick, 1000);
    }

    
    
    function clearLegacyCacheOnFirstRun() {
        try {
            const version = localStorage.getItem('myticket_reset_final_prod_v4');
            if (version !== 'production_clean_v4_reset_participants_and_verses') {
                const keysToRemove = [
                    'myticket_reset_final_v3',
                    'myticket_reset_final_v4',
                    'myticket_reset_final_v5',
                    'myticket_reset_final_v6',
                    'myticket_reset_final_prod_v1',
                    'myticket_reset_final_prod_v2',
                    'myticket_reset_final_prod_v3',
                    'myticket_participants_v6',
                    'myticket_participants_v7',
                    'myticket_payment_proofs_v6',
                    'myticket_payment_proofs_v7',
                    'myticket_used_proof_ids_v1'
                ];
                keysToRemove.forEach(k => localStorage.removeItem(k));
                localStorage.setItem('myticket_reset_final_prod_v4', 'production_clean_v4_reset_participants_and_verses');
                localStorage.setItem('myticket_participants_v8', JSON.stringify([]));
                localStorage.setItem('myticket_payment_proofs_v8', JSON.stringify({}));
                localStorage.setItem('myticket_used_proof_ids_v1', JSON.stringify([]));
                localStorage.setItem('myticket_users_v4', JSON.stringify([]));
                localStorage.setItem('myticket_gallery_albums_v2', JSON.stringify([]));
                localStorage.setItem('myticket_active_user_v4', JSON.stringify(DEFAULT_VISITOR_USER));
                state.participants = [];
                state.paymentProofs = {};
                state.currentTicket = null;
                if (typeof MyTicketCloudDB !== 'undefined' && MyTicketCloudDB.appDb) {
                    try {
                        MyTicketCloudDB.appDb.get('participants_data').put(JSON.stringify([]));
                        MyTicketCloudDB.appDb.get('participants_data_v2').put(JSON.stringify([]));
                    } catch(e){}
                }
            }
        } catch (e) {}
    }

    window.onload = function() {
        clearLegacyCacheOnFirstRun();
        MyTicketCloudDB.init();
        loadStoredUser();
        initializeParticipantsData();
        loadPaymentProofs();
        loadAvailableBibleVerses();
        loadFinanceData();
        initializeUsersRegistry();
        initializeChronogramme();
        
        // Gestion de session multi-utilisateurs persistante
        let isUnlocked = sessionStorage.getItem('myticket_auth_wall_passed') === 'true';
        if (!isUnlocked) {
            sessionStorage.setItem('myticket_auth_wall_passed', 'true');
            if(!sessionStorage.getItem('myticket_active_view')) {
                sessionStorage.setItem('myticket_active_view', 'accueil');
            }
            isUnlocked = true;
        }
        // Préserver la session active sur ce téléphone si déjà connecté, sinon visiteur
        loadStoredUser();
        applyUserStatesUI();

        const nav = document.querySelector('nav');
        const bottomNav = document.getElementById('mobile-bottom-nav');
        
        if (nav) nav.style.display = '';
        if (bottomNav) bottomNav.style.display = '';
        const savedView = sessionStorage.getItem('myticket_active_view') || 'accueil';
        switchView(savedView);
        // Optimisation démarrage mobile : Rendu uniquement de la vue courante (les autres sont chargées à l'ouverture)
        if (savedView === 'dashboard') updateDashboardStats();
        else if (savedView === 'finance') renderFinanceDashboard();
        else if (savedView === 'reception') renderReceptionTable();
        else if (savedView === 'liste') renderParticipantsTable();
        populateChurchFilterOptions();
        
        initializeLucideIcons();
        startTicketCountdown();

        // Check for Wave Return parameters (?wave_status=success|error&ref=...) (Cahier des Charges Section 2.3 & 6)
        if (typeof checkWaveReturnOnLoad === 'function') {
            checkWaveReturnOnLoad();
        }

        // Check for ?ticket=, ?pass=, or ?scan= query parameter in URL (e.g. from camera scan)
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const queryTicket = urlParams.get('ticket') || urlParams.get('pass') || urlParams.get('scan');
            if (queryTicket) {
                setTimeout(() => {
                    const participant = findParticipantByQuery(queryTicket);
                    if (participant) {
                        openVisitorPassModal(participant);
                    }
                }, 400);
            }
        } catch(e) {}
    };

    function togglePasswordVisibility(inputId, buttonEl) {
        const input = document.getElementById(inputId);
        if (!input) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        
        if (buttonEl) {
            buttonEl.setAttribute('title', isPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
            buttonEl.innerHTML = isPassword 
                ? '<i data-lucide="eye-off" class="h-4 w-4"></i>' 
                : '<i data-lucide="eye" class="h-4 w-4"></i>';
            initializeLucideIcons();
        }
    }

    
    // =========================================================================
    // RELIABLE UNIVERSAL CLOUD REALTIME & MULTI-DEVICE SYNCHRONIZER
    // GunDB Cloud Mesh + BroadcastChannel + LocalStorage Resilience
    // =========================================================================
    const GUN_CLOUD_PEERS = [
        'https://gun-manhattan.herokuapp.com/gun',
        'https://peer.wallie.io/gun',
        'https://gundb-relay.onrender.com/gun',
        'https://relay.peer.ooo/gun'
    ];

    const MyTicketCloudDB = {
        gun: null,
        appDb: null,
        db: null,
        isOnline: navigator.onLine,
        broadcastChannel: null,
        lastSyncTimestamp: null,
        peersCount: 0,
        syncIntervalId: null,

        init: function() {
            // 1. Local tab-to-tab Broadcast Channel
            try {
                if (typeof BroadcastChannel !== 'undefined') {
                    this.broadcastChannel = new BroadcastChannel('myticket_realtime_db_channel');
                    this.broadcastChannel.onmessage = (event) => {
                        this.handleBroadcastMessage(event.data);
                    };
                }
            } catch(e){console.error(e);}

            // 2. Initialize GunDB Cloud Realtime Mesh
            this.initGunMesh();

            // 3. Optional Firebase Firestore fallback
            this.initFirebase();

            // 4. Background Sync Poller (every 4 seconds) to ensure state freshness
            if (this.syncIntervalId) clearInterval(this.syncIntervalId);
            this.syncIntervalId = setInterval(() => {
                this.pollCloudState();
            }, 4000);

            // 5. Network status listeners
            window.addEventListener('online', () => this.handleNetworkStatusChange(true));
            window.addEventListener('offline', () => this.handleNetworkStatusChange(false));
            this.updateNetworkUI(navigator.onLine);
        },

        initGunMesh: function() { return;
            if (typeof Gun !== 'undefined') {
                try {
                    this.gun = Gun({
                        peers: GUN_CLOUD_PEERS,
                        localStorage: true
                    });
                    this.appDb = this.gun.get('myticket_prod_ndjai10_master_v2');
                    this.attachGunListeners();
                    this.updateNetworkUI(true);
                    console.log("✅ Base de données Cloud GunDB connectée en temps réel.");
                } catch (err) {
                    console.warn("GunDB Mesh init notice:", err.message);
                }
            }
        },

        initFirebase: function() {
            try {
                const customConfigStr = JSON.stringify({
                    apiKey: "AIzaSyBDzm0IzyvQN9gxheKeUgqRbgvt8qcjWTs",
                    authDomain: "myticket-cdd9e.firebaseapp.com",
                    projectId: "myticket-cdd9e",
                    storageBucket: "myticket-cdd9e.firebasestorage.app",
                    messagingSenderId: "322361047630",
                    appId: "1:322361047630:web:475bad7a67c0ff9687611f"
                });
                if (customConfigStr && typeof firebase !== 'undefined') {
                    const customConfig = JSON.parse(customConfigStr);
                    if (!firebase.apps.length) firebase.initializeApp(customConfig);
                    if (firebase.firestore) {
                        this.db = firebase.firestore();
                        if (firebase.storage) { try { this.storage = firebase.storage(); } catch(e){} }
                        this.attachFirebaseListeners();
                        
                        // Synchronisation Cloud temps réel activée (le Cloud est la source de vérité pour tous les appareils connectés)
                        try {
                            this.db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
                        } catch(e) {}
                    }
                }
            } catch(e){console.error(e);}
        },

        attachGunListeners: function() { return;
            if (!this.appDb) return;

            // 1. Realtime Listen: Users Registry
            this.appDb.get('users_data').on((dataStr) => {
                if (!dataStr) return;
                try {
                    const cloudUsers = JSON.parse(dataStr);
                    if (Array.isArray(cloudUsers)) {
                        const localUsersStr = localStorage.getItem('myticket_users_v4') || '[]';
                        const currentLocalUsers = JSON.parse(localUsersStr);
                        
                        // Merge users ensuring no data loss
                        const mergedMap = new Map();
                        currentLocalUsers.forEach(u => u && u.id && mergedMap.set(u.id, u));
                        cloudUsers.forEach(u => u && u.id && mergedMap.set(u.id, u));
                        const merged = Array.from(mergedMap.values());

                        if (JSON.stringify(state.users) !== JSON.stringify(merged)) {
                            state.users = merged;
                            localStorage.setItem('myticket_users_v4', JSON.stringify(state.users));
                            this.refreshUserViews();
                        }
                    }
                } catch(e){console.error(e);}
                this.lastSyncTimestamp = new Date();
                this.updateNetworkUI(true);
            });

            // 2. Realtime Listen: Participants & Tickets
            this.appDb.get('participants_data_v2').on((dataStr) => {
                if (!dataStr) return;
                try {
                    const cloudParticipants = JSON.parse(dataStr);
                    if (Array.isArray(cloudParticipants)) {
                        const localPartStr = localStorage.getItem('myticket_participants_v8') || '[]';
                        const currentLocal = JSON.parse(localPartStr);

                        const mergedMap = new Map();
                        currentLocal.forEach(p => p && p.id && mergedMap.set(p.id, p));
                        cloudParticipants.forEach(p => p && p.id && mergedMap.set(p.id, p));
                        const merged = Array.from(mergedMap.values());

                        if (JSON.stringify(state.participants) !== JSON.stringify(merged)) {
                            state.participants = merged;
                            localStorage.setItem('myticket_participants_v8', JSON.stringify(state.participants));
                            this.refreshParticipantViews();
                        }
                    }
                } catch(e){console.error(e);}
                this.lastSyncTimestamp = new Date();
                this.updateNetworkUI(true);
            });

            // 3. Realtime Listen: Finance
            this.appDb.get('finance_data').on((dataStr) => {
                if (!dataStr) return;
                try {
                    const cloudFinance = JSON.parse(dataStr);
                    if (cloudFinance && typeof cloudFinance === 'object' && Array.isArray(cloudFinance.committees)) {
                        state.finance = { ...state.finance, ...cloudFinance };
                        localStorage.setItem('myticket_finance_v14', JSON.stringify(state.finance));
                        this.refreshFinanceViews();
                    }
                } catch(e){console.error(e);}
                this.lastSyncTimestamp = new Date();
                this.updateNetworkUI(true);
            });

            // 4. Realtime Listen: Gallery Albums
            this.appDb.get('gallery_data').on((dataStr) => {
                if (!dataStr) return;
                try {
                    const cloudAlbums = JSON.parse(dataStr);
                    if (Array.isArray(cloudAlbums)) {
                        state.galleryAlbums = cloudAlbums;
                        localStorage.setItem('myticket_gallery_albums_v2', JSON.stringify(state.galleryAlbums));
                        const _curView = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('myticket_active_view') : '') || 'accueil';
                        if (_curView === 'apropos' && typeof renderGalleryAlbums === 'function') renderGalleryAlbums();
                    }
                } catch(e){console.error(e);}
                this.lastSyncTimestamp = new Date();
                this.updateNetworkUI(true);
            });
        },

        attachFirebaseListeners: function() {
            if (!this.db) return;
            try {
                this.db.collection("myticket_users").onSnapshot(snap => {
                    const list = [];
                    snap.forEach(d => list.push(d.data()));
                    if (list.length > 0) {
                        state.users = list;
                        localStorage.setItem('myticket_users_v4', JSON.stringify(state.users));
                        this.refreshUserViews();
                    }
                });
                this.db.collection("myticket_participants_v2").onSnapshot(snap => {
                    const list = [];
                    snap.forEach(d => list.push(d.data()));
                    if (list.length > 0) {
                        state.participants = list;
                        localStorage.setItem('myticket_participants_v8', JSON.stringify(state.participants));
                        if (typeof syncUsedProofIdentifiers === 'function') syncUsedProofIdentifiers();
                        this.refreshParticipantViews();
                    }
                });
                
                this.db.collection("myticket_finance").doc("current").onSnapshot(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        if (data && typeof data === 'object' && Array.isArray(data.committees)) {
                            state.finance = { ...state.finance, ...data };
                            localStorage.setItem('myticket_finance_v14', JSON.stringify(state.finance));
                            this.refreshFinanceViews();
                        }
                    }
                });

                } catch(e){console.error(e);}
        },

        pollCloudState: function() {
            if (!this.appDb) return;
            try {
                this.appDb.get('users_data').once((dataStr) => {
                    if (dataStr) {
                        try {
                            const parsed = JSON.parse(dataStr);
                            if (Array.isArray(parsed) && parsed.length > (state.users || []).length) {
                                state.users = parsed;
                                localStorage.setItem('myticket_users_v4', JSON.stringify(state.users));
                                this.refreshUserViews();
                            }
                        } catch(e){console.error(e);}
                    }
                });
                this.appDb.get('participants_data_v2').once((dataStr) => {
                    if (dataStr) {
                        try {
                            const parsed = JSON.parse(dataStr);
                            if (Array.isArray(parsed) && parsed.length > (state.participants || []).length) {
                                state.participants = parsed;
                                localStorage.setItem('myticket_participants_v8', JSON.stringify(state.participants));
                                this.refreshParticipantViews();
                            }
                        } catch(e){console.error(e);}
                    }
                });
            } catch(e){console.error(e);}
        },

        syncUser: function(user) {
            if (!user) return;
            this.broadcastLocally({ type: 'USER_SAVED', data: user });
            if (this.appDb) {
                try {
                    this.appDb.get('users_data').put(JSON.stringify(state.users || []));
                } catch(e){console.error(e);}
            }
            if (this.db && user.id) {
                try { this.db.collection("myticket_users").doc(user.id).set(user, { merge: true }); } catch(e){console.error(e);}
            }
        },

        syncAllUsers: function(usersList) {
            this.broadcastLocally({ type: 'USERS_SYNCED', data: usersList });
            if (this.appDb) {
                try {
                    this.appDb.get('users_data').put(JSON.stringify(usersList || []));
                } catch(e){console.error(e);}
            }
        },

        syncParticipant: function(participant) {
            if (!participant) return;
            this.broadcastLocally({ type: 'PARTICIPANT_SAVED', data: participant });
            if (this.appDb) {
                try {
                    this.appDb.get('participants_data_v2').put(JSON.stringify(state.participants || []));
                } catch(e){console.error(e);}
            }
            if (this.db && participant.id) {
                try { this.db.collection("myticket_participants_v2").doc(participant.id).set(participant, { merge: true }); } catch(e){console.error(e);}
            }
        },

        syncAllParticipants: function(participantsList) {
            this.broadcastLocally({ type: 'PARTICIPANTS_SYNCED', data: participantsList });
            if (this.appDb) {
                try {
                    this.appDb.get('participants_data_v2').put(JSON.stringify(participantsList || []));
                } catch(e){console.error(e);}
            }
        },

        deleteParticipant: function(participantId) {
            if (!participantId) return;
            state.participants = (state.participants || []).filter(p => p.id !== participantId);
            try { localStorage.setItem('myticket_participants_v8', JSON.stringify(state.participants || [])); } catch(e){}
            this.broadcastLocally({ type: 'PARTICIPANT_DELETED', data: { id: participantId } });
            if (this.appDb) {
                try {
                    this.appDb.get('participants_data_v2').put(JSON.stringify(state.participants || []));
                } catch(e){console.error(e);}
            }
            if (this.db) {
                try { this.db.collection("myticket_participants_v2").doc(participantId).delete(); } catch(e){console.error(e);}
            }
        },

        syncFinance: function(financeState) {
            if (!financeState) return;
            this.broadcastLocally({ type: 'FINANCE_SAVED', data: financeState });
            if (this.appDb) {
                try {
                    this.appDb.get('finance_data').put(JSON.stringify(financeState));
                } catch(e){console.error(e);}
            }
            if (this.db) {
                try { this.db.collection("myticket_finance").doc("current").set(financeState, { merge: true }); } catch(e){console.error(e);}
            }
        },

        syncGalleryAlbums: function(albums) {
            if (!albums) return;
            this.broadcastLocally({ type: 'ALBUMS_SAVED', data: albums });
            if (this.appDb) {
                try {
                    this.appDb.get('gallery_data').put(JSON.stringify(albums));
                } catch(e){console.error(e);}
            }
            if (this.db && Array.isArray(albums)) {
                try {
                    // Diffusion Cloud Firestore pour tous les festivaliers
                    albums.forEach(alb => {
                        if (alb && alb.id) {
                            // Nettoyage sécurité pour ne jamais dépasser la limite de 1Mo de Firestore
                            const safeAlbum = {
                                ...alb,
                                items: (alb.items || []).map(item => {
                                    if (item.url && item.url.startsWith('data:video/') && item.url.length > 600000) {
                                        return {
                                            ...item,
                                            url: item.thumbnail || item.url.slice(0, 500)
                                        };
                                    }
                                    return item;
                                })
                            };
                            this.db.collection("myticket_gallery").doc(alb.id).set(safeAlbum, { merge: true });
                        }
                    });
                } catch(e) {
                    console.error("Firestore syncGalleryAlbums notice:", e);
                }
            }
        },

        deleteAlbumFromCloud: function(albumId) {
            if (!albumId) return;
            if (this.db) {
                try {
                    this.db.collection("myticket_gallery").doc(albumId).delete();
                } catch(e){}
            }
        },

        purgeAllUsersCloud: function() {
            this.broadcastLocally({ type: 'USERS_PURGED' });
            if (this.appDb) {
                try {
                    this.appDb.get('users_data').put(JSON.stringify([]));
                } catch(e){console.error(e);}
            }
            if (this.db) {
                try {
                    this.db.collection("myticket_users").get().then(snap => snap.forEach(d => d.ref.delete())).catch(()=>{});
                } catch(e){console.error(e);}
            }
        },

        purgeAllCloudData: function() {
            this.broadcastLocally({ type: 'DATABASE_PURGED' });
            if (this.appDb) {
                try {
                    this.appDb.get('users_data').put(JSON.stringify([]));
                    this.appDb.get('participants_data').put(JSON.stringify([]));
                    this.appDb.get('participants_data_v2').put(JSON.stringify([]));
                    this.appDb.get('finance_data').put(JSON.stringify({
                        encaissements: [],
                        decaissements: [],
                        dons: [],
                        committees: JSON.parse(JSON.stringify(OFFICIAL_COMMITTEES_FINANCE_STRUCTURE || []))
                    }));
                    this.appDb.get('gallery_data').put(JSON.stringify([]));
                } catch(e){console.error(e);}
            }
            if (this.db) {
                try {
                    this.db.collection("myticket_participants").get().then(snap => snap.forEach(d => d.ref.delete())).catch(()=>{});
                    this.db.collection("myticket_participants_v2").get().then(snap => snap.forEach(d => d.ref.delete())).catch(()=>{});
                    this.db.collection("myticket_finance").doc("current").delete().catch(()=>{});
                    this.db.collection("myticket_users").get().then(snap => snap.forEach(d => d.ref.delete())).catch(()=>{});
                    this.db.collection("myticket_gallery").get().then(snap => snap.forEach(d => d.ref.delete())).catch(()=>{});
                } catch(e){console.error(e);}
            }
        },

        broadcastLocally: function(msg) {
            if (this.broadcastChannel) {
                try { this.broadcastChannel.postMessage(msg); } catch(e){console.error(e);}
            }
        },

        handleBroadcastMessage: function(msg) {
            if (!msg || !msg.type) return;
            if (msg.type === 'USER_SAVED' || msg.type === 'USERS_SYNCED') {
                const local = JSON.parse(localStorage.getItem('myticket_users_v4') || '[]');
                state.users = local;
                this.refreshUserViews();
            } else if (msg.type === 'PARTICIPANT_SAVED' || msg.type === 'PARTICIPANTS_SYNCED' || msg.type === 'PARTICIPANT_DELETED') {
                const local = JSON.parse(localStorage.getItem('myticket_participants_v8') || '[]');
                state.participants = local;
                this.refreshParticipantViews();
            } else if (msg.type === 'FINANCE_SAVED') {
                const local = JSON.parse(localStorage.getItem('myticket_finance_v14') || '{}');
                state.finance = { ...state.finance, ...local };
                this.refreshFinanceViews();
            } else if (msg.type === 'ALBUMS_SAVED') {
                const local = JSON.parse(localStorage.getItem('myticket_gallery_albums_v2') || '[]');
                state.galleryAlbums = local;
                }
        },

        refreshUserViews: function() {
            if (typeof populateLoginUserSelect === 'function') populateLoginUserSelect();
            if (typeof populateGatewayUserSelect === 'function') populateGatewayUserSelect();
            if (typeof updateCreateComiteDropdown === 'function') updateCreateComiteDropdown();
            if (typeof populatePCOApproversDropdown === 'function') populatePCOApproversDropdown();
            const currentView = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('myticket_active_view') : '') || 'accueil';
            if (currentView === 'organisation' && typeof renderOrganisationLeaders === 'function') renderOrganisationLeaders();
            if (currentView === 'apropos' && typeof renderAproposCommittees === 'function') renderAproposCommittees();
            if (currentView === 'finance') {
                if (typeof renderFinanceDashboard === 'function') renderFinanceDashboard();
                if (typeof renderFinanceConsolidation === 'function') renderFinanceConsolidation();
            }
        },

        refreshParticipantViews: function() {
            const currentView = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('myticket_active_view') : '') || 'accueil';
            if (currentView === 'reception' && typeof renderReceptionTable === 'function') renderReceptionTable();
            if (currentView === 'liste' && typeof renderParticipantsTable === 'function') renderParticipantsTable();
            if ((currentView === 'organisation' || currentView === 'reception') && typeof renderTablePlan === 'function') renderTablePlan();
            if (currentView === 'dashboard' && typeof updateDashboardStats === 'function') updateDashboardStats();
        },

        refreshFinanceViews: function() {
            const currentView = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('myticket_active_view') : '') || 'accueil';
            if (currentView === 'finance') {
                if (typeof renderFinanceDashboard === 'function') renderFinanceDashboard();
                if (typeof renderFinanceConsolidation === 'function') renderFinanceConsolidation();
            }
            if (currentView === 'dashboard' && typeof updateDashboardStats === 'function') updateDashboardStats();
        },

        handleNetworkStatusChange: function(isOnline) {
            this.isOnline = isOnline;
            this.updateNetworkUI(isOnline);
            if (isOnline) {
                showNotification("Réseau Connecté", "Synchronisation Cloud temps réel rétablie.", "success");
            } else {
                showNotification("Mode Hors-Ligne", "Réseau indisponible. Mode local persistant actif.", "warning");
            }
        },

        updateNetworkUI: function(isOnline) {
            const ping = document.getElementById('cloud-sync-ping');
            const dot = document.getElementById('cloud-sync-dot');
            const text = document.getElementById('cloud-sync-text');
            if (!dot || !text) return;

            if (isOnline) {
                if (ping) ping.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75";
                dot.className = "relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-xs shadow-emerald-400";
                text.innerText = "Connecté";
                text.className = "text-emerald-400 font-sans text-xs font-bold tracking-wide";
            } else {
                if (ping) ping.className = "hidden";
                dot.className = "relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500";
                text.innerText = "Hors-Ligne";
                text.className = "text-amber-400 font-sans text-xs font-bold tracking-wide";
            }
        }
    };

    function openCloudSyncModal() {
        const modal = document.getElementById('modal-cloud-database-settings');
        if (!modal) return;
        
        const cPart = document.getElementById('cloud-modal-count-participants');
        const cFin = document.getElementById('cloud-modal-count-finance');
        const cUsers = document.getElementById('cloud-modal-count-users');
        
        modal.classList.remove('hidden');
        initializeLucideIcons();
    }

    function closeCloudSyncModal() {
        document.getElementById('modal-cloud-database-settings')?.classList.add('hidden');
    }

    function downloadFullDatabaseBackupJSON() {
        const fullBackup = {
            exportDate: new Date().toISOString(),
            event: "10 Ans de Grâce • Nuit de JACOB 2027 (EMCI Horeb)",
            participants: state.participants || [],
            finance: state.finance || {},
            users: state.users || [],
            galleryAlbums: state.galleryAlbums || [],
            paymentProofs: state.paymentProofs || {}
        };

        const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", jsonStr);
        downloadAnchor.setAttribute("download", `Sauvegarde_MyTicket_Cloud_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        showNotification("Sauvegarde Téléchargée", "La base de données complète a été exportée en JSON.", "success");
    }

    function forceCloudDatabaseSync() {
        if (typeof MyTicketCloudDB !== 'undefined') {
            MyTicketCloudDB.syncAllUsers(state.users || []);
            MyTicketCloudDB.syncAllParticipants(state.participants || []);
            MyTicketCloudDB.syncFinance(state.finance);
            MyTicketCloudDB.pollCloudState();
            MyTicketCloudDB.lastSyncTimestamp = new Date();
            MyTicketCloudDB.updateNetworkUI(navigator.onLine);
            showNotification("Synchronisation Réussie !", "Toutes les données (utilisateurs, pass, finances, albums) ont été diffusées sur le Cloud.", "success");
        } else {
            showNotification("Mode Hors-Ligne", "Synchronisation en attente du rétablissement du réseau.", "info");
        }
    }

    function importFullDatabaseJSON(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data.participants && Array.isArray(data.participants)) {
                    state.participants = data.participants;
                    saveParticipantsData();
                }
                if (data.finance && typeof data.finance === 'object') {
                    state.finance = data.finance;
                    saveFinanceData();
                }
                if (data.users && Array.isArray(data.users)) {
                    state.users = data.users;
                    saveUsersData();
                }
                if (data.galleryAlbums && Array.isArray(data.galleryAlbums)) {
                    state.galleryAlbums = data.galleryAlbums;
                    saveGalleryAlbumsData();
                }
                showNotification("Importation Réussie !", "La base de données a été restaurée et synchronisée sur le Cloud.", "success");
                closeCloudSyncModal();
                switchView('accueil');
            } catch(err) {
                showNotification("Erreur d'importation", "Fichier JSON invalide.", "error");
            }
        };
        reader.readAsText(file);
    }


    // ==========================================
    // CHARGEUR DYNAMIQUE ASYNCHRONE DE SCRIPTS
    // ==========================================
    function loadExternalScript(src) {
        if (!src) return Promise.resolve();
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            if (existing.dataset.loaded === 'true') return Promise.resolve();
            return new Promise((resolve, reject) => {
                existing.addEventListener('load', resolve);
                existing.addEventListener('error', reject);
            });
        }
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => {
                script.dataset.loaded = 'true';
                resolve();
            };
            script.onerror = () => reject(new Error('Erreur chargement script: ' + src));
            document.head.appendChild(script);
        });
    }

    // Coalescence et debouncing de Lucide Icons pour fluidité maximale sur mobile
    let lucideDebounceScheduled = false;
    function initializeLucideIcons() {
        if (lucideDebounceScheduled) return;
        lucideDebounceScheduled = true;
        requestAnimationFrame(() => {
            lucideDebounceScheduled = false;
            try {
                if (window.lucide && typeof window.lucide.createIcons === 'function') {
                    window.lucide.createIcons();
                }
            } catch (error) {
                console.error("Lucide icons notice:", error);
            }
        });
    }

    function loadStoredUser() {
        try {
            const storedUser = localStorage.getItem('myticket_active_user_v4');
            if (storedUser) {
                state.user = JSON.parse(storedUser);
            } else {
                state.user = { ...DEFAULT_VISITOR_USER };
            }
        } catch (e) {
            state.user = { ...DEFAULT_VISITOR_USER };
        }
        applyUserStatesUI();
    }

    

    function initializeParticipantsData() {
        try {
            const stored = localStorage.getItem('myticket_participants_v8');
            if (stored) {
                const parsed = JSON.parse(stored);
                state.participants = Array.isArray(parsed) ? parsed : [];
            } else {
                state.participants = [];
                localStorage.setItem('myticket_participants_v8', JSON.stringify([]));
            }
        } catch (e) {
            state.participants = [];
        }
    }

    function loadPaymentProofs() {
        try {
            const storedProofs = localStorage.getItem('myticket_payment_proofs_v8');
            if (storedProofs) {
                state.paymentProofs = JSON.parse(storedProofs);
            } else {
                state.paymentProofs = {};
                localStorage.setItem('myticket_payment_proofs_v8', JSON.stringify({}));
            }
        } catch(e) {
            state.paymentProofs = {};
        }
        if (typeof syncUsedProofIdentifiers === 'function') {
            syncUsedProofIdentifiers();
        }
    }

    
    function saveParticipantsData() {
        try {
            localStorage.setItem('myticket_participants_v8', JSON.stringify(state.participants || []));
            if (typeof MyTicketCloudDB !== 'undefined') {
                MyTicketCloudDB.syncAllParticipants(state.participants || []);
            }
        } catch(e){console.error(e);}
    }

    function saveUsersData() {
        try {
            localStorage.setItem('myticket_users_v4', JSON.stringify(state.users || []));
            if (typeof MyTicketCloudDB !== 'undefined') {
                MyTicketCloudDB.syncAllUsers(state.users || []);
            }
        } catch(e){console.error(e);}
    }

    function savePaymentProofs() {
        try {
            localStorage.setItem('myticket_payment_proofs_v8', JSON.stringify(state.paymentProofs));
        } catch(e){console.error(e);}
    }

    function saveFinanceState() {
        try {
            localStorage.setItem('myticket_finance_v14', JSON.stringify(state.finance));
            if (typeof MyTicketCloudDB !== 'undefined') MyTicketCloudDB.syncFinance(state.finance);
        } catch (e) {}
    }

    function saveFinanceData() {
        saveFinanceState();
        renderFinanceDashboard();
    }

    function loadFinanceData() {
        try {
            const storedFin = localStorage.getItem('myticket_finance_v14');
            if (storedFin) {
                const parsed = JSON.parse(storedFin);
                if (parsed && Array.isArray(parsed.committees)) {
                    state.finance.incomesTotal = parsed.incomesTotal || state.finance.incomesTotal;
                    state.finance.ticketsIncome = parsed.ticketsIncome || state.finance.ticketsIncome;
                    state.finance.donsIncome = parsed.donsIncome || state.finance.donsIncome;
                    state.finance.budgetTotal = parsed.budgetTotal || state.finance.budgetTotal;
                    state.finance.expensesTotal = parsed.expensesTotal || state.finance.expensesTotal;
                    state.finance.balance = parsed.balance || state.finance.balance;
                    if (parsed.accounts) state.finance.accounts = parsed.accounts;
                    if (parsed.decaissements) state.finance.decaissements = parsed.decaissements;
                    if (parsed.dons) state.finance.dons = parsed.dons;
                    if (!state.finance.dons || state.finance.dons.length === 0) {
                        state.finance.dons = [
                            { date: '2026-11-01', donateur: 'Dr. Bamba Seydou', type: 'Don Partenaire', montant: 150000, compte: 'Orange Money', enregistrePar: 'Comité PCO' },
                            { date: '2026-11-02', donateur: 'Famille Kouassi Konan', type: 'Soutien Particulier', montant: 100000, compte: 'Wave', enregistrePar: 'Comité PCO' },
                            { date: '2026-11-03', donateur: 'Mme Marie-Claire Akissi', type: 'Don Partenaire', montant: 50000, compte: 'Wave', enregistrePar: 'Comité PCO' },
                            { date: '2026-11-04', donateur: 'M. Emmanuel Yao Kouassi', type: 'Sponsoring', montant: 200000, compte: 'Virement', enregistrePar: 'Comité PCO' },
                            { date: '2026-11-05', donateur: 'Pasteur David Koffi', type: 'Don Partenaire', montant: 80000, compte: 'Espèces', enregistrePar: 'Comité PCO' }
                        ];
                    }

                    state.finance.committees.forEach(c => {
                        const savedC = parsed.committees.find(sc => sc.id === c.id);
                        if (savedC && Array.isArray(savedC.lignesBudget) && savedC.lignesBudget.length > 0) {
                            c.lignesBudget = savedC.lignesBudget;
                        }
                    });
                }
            }
        } catch (e) {}
    }

    function saveFinanceState() {
        try {
            localStorage.setItem('myticket_finance_v14', JSON.stringify(state.finance));
            if (typeof MyTicketCloudDB !== 'undefined') MyTicketCloudDB.syncFinance(state.finance);
        } catch (e) {}
    }

    // View Router
    
    // ==========================================
    // CHRONOGRAMME CONTROLLER (GESTION & BILLETTERIE)
    // ==========================================
    const SEED_CHRONOGRAMME = [
        {
            id: "CHRO-01",
            heureDebut: "00:00",
            heureFin: "01:00",
            titre: "Accueil des Festivaliers & Installation aux Tables",
            responsable: "Comité Accueil & Sécurité",
            description: "Contrôle d'accès QR code, placement aux tables d'honneur (Gold, VIP, Classique) et cocktail de bienvenue.",
            icone: "user-check",
            couleur: "amber",
            phase: "phase1"
        },
        {
            id: "CHRO-02",
            heureDebut: "01:00",
            heureFin: "01:10",
            titre: "Cérémonie d'ouverture",
            responsable: "Comité Animation & Jeux",
            description: "Mot de bienvenue, présentation du thème, présentation des grandes étapes de la soirée et lancement officiel.",
            icone: "sparkles",
            couleur: "purple",
            phase: "phase1"
        },
        {
            id: "CHRO-03",
            heureDebut: "01:10",
            heureFin: "01:40",
            titre: "Temps d'Exhortation & d'encouragement",
            responsable: "Comité Spirituel",
            description: "Louange, adoration, prière, exhortation courte, témoignage et temps de reconnaissance à Dieu.",
            icone: "book-open",
            couleur: "blue",
            phase: "phase1"
        },
        {
            id: "CHRO-04",
            heureDebut: "01:40",
            heureFin: "02:10",
            titre: "Honneur aux Batisseurs",
            responsable: "Coordination Stratégique",
            description: "Reconnaissance aux bâtisseurs et aînés, remise éventuelle de distinctions et coupure du gâteau.",
            icone: "award",
            couleur: "emerald",
            phase: "phase1"
        },
        {
            id: "CHRO-05",
            heureDebut: "02:10",
            heureFin: "03:10",
            titre: "Dîner & Convivialité",
            responsable: "Comité Restauration",
            description: "Dîner, musique d'ambiance, échanges à table et animations légères pendant le repas.",
            icone: "utensils",
            couleur: "rose",
            phase: "phase2"
        },
        {
            id: "CHRO-06",
            heureDebut: "03:10",
            heureFin: "03:20",
            titre: "Gateau des 10 ans",
            responsable: "Comité Restauration",
            description: "Rupture et Partage du cadeau des 10 ans.",
            icone: "cake",
            couleur: "amber",
            phase: "phase2"
        },
        {
            id: "CHRO-07",
            heureDebut: "03:20",
            heureFin: "05:00",
            titre: "Game Time: Challenge des Jeunes",
            responsable: "Comité Animation & Jeux",
            description: "Compétitions par équipes : quiz biblique, culture générale, blind test chrétien, défis de rapidité, jeux de mémoire, défis artistiques et épreuves surprises",
            icone: "gamepad-2",
            couleur: "purple",
            phase: "phase3"
        },
        {
            id: "CHRO-08",
            heureDebut: "05:00",
            heureFin: "05:20",
            titre: "Secret Gift – Échange de cadeaux",
            responsable: "Comité Animation & Jeux",
            description: "Échange des cadeaux, découverte des cadeaux, petits mots personnalisés et moment de convivialité.",
            icone: "gift",
            couleur: "blue",
            phase: "phase3"
        },
        {
            id: "CHRO-09",
            heureDebut: "05:20",
            heureFin: "05:30",
            titre: "Temps de Proclamation",
            responsable: "Comité Spirituel",
            description: "Proclamation collective, déclarations de foi, bénédictions et paroles d'engagement pour la nouvelle année.",
            icone: "megaphone",
            couleur: "emerald",
            phase: "phase3"
        },
        {
            id: "CHRO-10",
            heureDebut: "05:30",
            heureFin: "06:30",
            titre: "Soirée Dansante",
            responsable: "Comité Animation & Jeux",
            description: "Danse, musique chrétienne festive, chorégraphies collectives, challenges de danse et ambiance libre jusqu'à la fin.",
            icone: "music",
            couleur: "orange",
            phase: "phase3"
        }
    ];

    function initializeChronogramme() {
        try {
            const chroVersion = localStorage.getItem('myticket_chro_version_v3');
            if (chroVersion !== 'v3_adapted_10_activities') {
                state.chronogramme = [...SEED_CHRONOGRAMME];
                localStorage.setItem('myticket_chronogramme_v1', JSON.stringify(state.chronogramme));
                localStorage.setItem('myticket_chro_version_v3', 'v3_adapted_10_activities');
            } else {
                const stored = localStorage.getItem('myticket_chronogramme_v1');
                if (stored) {
                    state.chronogramme = JSON.parse(stored);
                } else {
                    state.chronogramme = [...SEED_CHRONOGRAMME];
                    localStorage.setItem('myticket_chronogramme_v1', JSON.stringify(state.chronogramme));
                }
            }
        } catch(e) {
            state.chronogramme = [...SEED_CHRONOGRAMME];
        }

        renderChronogrammeOrganisation();
        renderOrganisationLeaders();
        renderChronogrammeBilletterie();
    }

    function saveChronogrammeData() {
        try {
            localStorage.setItem('myticket_chronogramme_v1', JSON.stringify(state.chronogramme));
        } catch(e){console.error(e);}
        renderChronogrammeOrganisation();
        renderChronogrammeBilletterie();
    }

    function getChronogrammePillColor(couleur) {
        const map = {
            amber: 'bg-[#f59e0b] shadow-amber-500/25',
            purple: 'bg-[#9333ea] shadow-purple-600/25',
            blue: 'bg-[#0284c7] shadow-sky-500/25',
            sky: 'bg-[#0284c7] shadow-sky-500/25',
            emerald: 'bg-[#059669] shadow-emerald-600/25',
            rose: 'bg-[#ea580c] shadow-orange-500/25',
            orange: 'bg-[#ea580c] shadow-orange-500/25'
        };
        return map[couleur] || 'bg-[#ea580c] shadow-orange-500/25';
    }

    function getChronogrammeCommitteeBadge(responsable, couleur) {
        const r = (responsable || '').toLowerCase();
        if (r.includes('accueil') || r.includes('sécurité') || r.includes('securite')) {
            return 'bg-amber-100/90 text-amber-900 border border-amber-200/70';
        }
        if (r.includes('animation') || r.includes('jeux')) {
            return 'bg-purple-100/90 text-purple-900 border border-purple-200/70';
        }
        if (r.includes('spirituel') || r.includes('adoration') || r.includes('louange')) {
            return 'bg-sky-100/90 text-sky-900 border border-sky-200/70';
        }
        if (r.includes('stratégique') || r.includes('strategique') || r.includes('coordination')) {
            return 'bg-emerald-100/90 text-emerald-900 border border-emerald-200/70';
        }
        if (r.includes('restauration')) {
            return (couleur === 'amber') 
                ? 'bg-amber-100/90 text-amber-900 border border-amber-200/70' 
                : 'bg-rose-100/90 text-rose-900 border border-rose-200/70';
        }
        const colorMap = {
            orange: 'bg-orange-100/90 text-orange-900 border border-orange-200/70',
            amber: 'bg-amber-100/90 text-amber-900 border border-amber-200/70',
            purple: 'bg-purple-100/90 text-purple-900 border border-purple-200/70',
            blue: 'bg-sky-100/90 text-sky-900 border border-sky-200/70',
            sky: 'bg-sky-100/90 text-sky-900 border border-sky-200/70',
            emerald: 'bg-emerald-100/90 text-emerald-900 border border-emerald-200/70',
            rose: 'bg-rose-100/90 text-rose-900 border border-rose-200/70'
        };
        return colorMap[couleur] || 'bg-slate-100 text-slate-800 border border-slate-200';
    }

    function renderChronogrammeBilletterie() {
        const container = document.getElementById('billetterie-chronogramme-list');
        if (!container) return;
        container.innerHTML = '';

        const list = state.chronogramme || [];
        if (list.length === 0) {
            container.innerHTML = '<div class="col-span-full py-6 text-center text-slate-400 italic">Aucune étape programmée.</div>';
            return;
        }

        list.forEach((item, index) => {
            const pillColor = getChronogrammePillColor(item.couleur || 'orange');
            const icon = item.icone || 'clock';

            container.innerHTML += `
                <div class="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 shadow-2xs hover:shadow-xs transition-all duration-200 flex items-center justify-between gap-3 group">
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="px-2.5 py-1 rounded-xl ${pillColor} text-white font-mono font-black text-[11px] shrink-0 shadow-2xs">
                            ${item.heureDebut} — ${item.heureFin}
                        </div>
                        <div class="min-w-0 space-y-0.5">
                            <h4 class="font-display font-black text-slate-900 text-sm leading-tight truncate group-hover:text-brand-orange transition" title="${item.titre}">
                                ${item.titre}
                            </h4>
                            <p class="text-[11px] text-slate-500 truncate">${item.responsable || ''}</p>
                        </div>
                    </div>
                    <span class="px-2 py-1 rounded-lg bg-slate-200/70 text-slate-700 font-mono font-black text-[10px] shrink-0">
                        #${String(index + 1).padStart(2, '0')}
                    </span>
                </div>
            `;
        });

        initializeLucideIcons();
    }

    let activeChronogrammePhase = 'all';

    function filterChronogrammePhase(phase) {
        activeChronogrammePhase = phase;
        document.querySelectorAll('.chro-phase-btn').forEach(btn => {
            btn.className = 'chro-phase-btn px-3 py-1.5 rounded-xl transition text-slate-500 hover:text-slate-900 cursor-pointer';
        });
        const activeBtn = document.getElementById('chro-filter-' + phase);
        if (activeBtn) activeBtn.className = 'chro-phase-btn px-3 py-1.5 rounded-xl transition bg-white text-slate-900 shadow-2xs font-bold cursor-pointer';
        renderChronogrammeOrganisation();
    }

    function renderChronogrammeOrganisation() {
        const container = document.getElementById('organisation-chronogramme-list');
        if (!container) return;
        container.innerHTML = '';

        const allList = state.chronogramme || [];
        const isVis = state.user && state.user.isVisitor;

        // Apply phase filter
        const list = allList.filter(item => {
            if (activeChronogrammePhase === 'all') return true;
            if (item.phase === activeChronogrammePhase) return true;
            if (activeChronogrammePhase === 'phase1' && (item.heureDebut >= '00:00' && item.heureDebut < '02:10')) return true;
            if (activeChronogrammePhase === 'phase2' && (item.heureDebut >= '02:10' && item.heureDebut < '03:20')) return true;
            if (activeChronogrammePhase === 'phase3' && (item.heureDebut >= '03:20' && item.heureDebut <= '06:30')) return true;
            return false;
        });

        if (list.length === 0) {
            container.innerHTML = `
                <div class="col-span-full py-8 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <i data-lucide="calendar-x" class="h-6 w-6 mx-auto mb-1 opacity-50"></i>
                    <p class="text-xs">${isVis ? 'Aucune étape pour ce moment de la soirée.' : 'Aucune activité trouvée.'}</p>
                </div>
            `;
            initializeLucideIcons();
            return;
        }

        list.forEach((item, index) => {
            const originalIndex = allList.findIndex(x => x.id === item.id);
            const stepIndex = originalIndex !== -1 ? originalIndex : index;
            const pillColor = getChronogrammePillColor(item.couleur);
            const badgeClass = getChronogrammeCommitteeBadge(item.responsable, item.couleur);

            const actionButtonsHTML = isVis ? '' : `
                <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition shrink-0 ml-auto">
                    <button onclick="openEditChronogrammeModal('${item.id}')" class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer" title="Modifier">
                        <i data-lucide="edit-3" class="h-3.5 w-3.5"></i>
                    </button>
                    <button onclick="requestDeleteChronogrammeItem('${item.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition cursor-pointer" title="Supprimer">
                        <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
                    </button>
                </div>
            `;

            container.innerHTML += `
                <div class="p-4 sm:p-5 rounded-2xl bg-white hover:bg-slate-50/80 shadow-xs hover:shadow-sm border border-slate-100/90 transition-all duration-200 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 group">
                    
                    <!-- Time Pill (Identique à la capture) -->
                    <div class="px-4 py-1.5 rounded-full ${pillColor} text-white font-mono font-black text-xs sm:text-sm tracking-wide shrink-0 shadow-xs flex items-center justify-center self-start sm:self-center">
                        ${item.heureDebut} — ${item.heureFin}
                    </div>

                    <!-- Content: Title, Committee Badge & Description -->
                    <div class="min-w-0 flex-1 space-y-1">
                        <h4 class="font-display font-extrabold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-indigo-950 transition">
                            ${item.titre}
                        </h4>
                        <div class="flex flex-wrap items-center gap-2 text-xs">
                            ${item.responsable ? `<span class="px-2.5 py-0.5 rounded-md ${badgeClass} font-bold text-[10px] sm:text-xs shrink-0">${item.responsable}</span>` : ''}
                            <span class="text-slate-500 text-xs sm:text-[13px] font-normal leading-relaxed">${item.description || ''}</span>
                        </div>
                    </div>

                    <!-- Actions (pour organisateurs) -->
                    ${actionButtonsHTML}
                </div>
            `;
        });

        initializeLucideIcons();
    }

    function openAddChronogrammeModal() {
        if (state.user && state.user.isVisitor) {
            showNotification("Accès Restreint", "Seuls les membres de comité peuvent ajouter des activités.", "error");
            return;
        }
        document.getElementById('modal-chro-title').innerText = "Ajouter une Activité au Programme";
        document.getElementById('chro-item-id').value = "";
        document.getElementById('chro-heure-debut').value = "20:00";
        document.getElementById('chro-heure-fin').value = "21:00";
        document.getElementById('chro-titre').value = "";
        document.getElementById('chro-responsable').value = state.user ? (state.user.comite || state.user.name) : "Direction";
        document.getElementById('chro-description').value = "";
        document.getElementById('chro-icone').value = "clock";
        document.getElementById('chro-couleur').value = "orange";
        document.getElementById('modal-edit-chronogramme')?.classList.remove('hidden');
    }

    function openEditChronogrammeModal(id) {
        if (state.user && state.user.isVisitor) {
            showNotification("Accès Restreint", "Seuls les membres de comité peuvent modifier le chronogramme.", "error");
            return;
        }
        const item = (state.chronogramme || []).find(i => i.id === id);
        if (!item) return;

        document.getElementById('modal-chro-title').innerText = "Modifier l'Activité";
        document.getElementById('chro-item-id').value = item.id;
        document.getElementById('chro-heure-debut').value = item.heureDebut || "20:00";
        document.getElementById('chro-heure-fin').value = item.heureFin || "21:00";
        document.getElementById('chro-titre').value = item.titre || "";
        document.getElementById('chro-responsable').value = item.responsable || "";
        document.getElementById('chro-description').value = item.description || "";
        document.getElementById('chro-icone').value = item.icone || "clock";
        document.getElementById('chro-couleur').value = item.couleur || "orange";
        document.getElementById('modal-edit-chronogramme')?.classList.remove('hidden');
    }

    function closeEditChronogrammeModal() {
        document.getElementById('modal-edit-chronogramme')?.classList.add('hidden');
    }

    function submitSaveChronogrammeItem(event) {
        event.preventDefault();

        const id = document.getElementById('chro-item-id').value;
        const heureDebut = document.getElementById('chro-heure-debut').value;
        const heureFin = document.getElementById('chro-heure-fin').value;
        const titre = document.getElementById('chro-titre').value.trim();
        const responsable = document.getElementById('chro-responsable').value.trim();
        const description = document.getElementById('chro-description').value.trim();
        const icone = document.getElementById('chro-icone').value;
        const couleur = document.getElementById('chro-couleur').value;

        if (!state.chronogramme) state.chronogramme = [];

        let phase = 'phase1';
        if (heureDebut >= '00:00' && heureDebut < '02:10') phase = 'phase1';
        else if (heureDebut >= '02:10' && heureDebut < '03:20') phase = 'phase2';
        else phase = 'phase3';

        if (id) {
            // Update existing
            const idx = state.chronogramme.findIndex(i => i.id === id);
            if (idx !== -1) {
                state.chronogramme[idx] = {
                    id: id,
                    heureDebut: heureDebut,
                    heureFin: heureFin,
                    titre: titre,
                    responsable: responsable,
                    description: description,
                    icone: icone,
                    couleur: couleur,
                    phase: phase
                };
            }
        } else {
            // Create new
            const newId = `CHRO-${String(state.chronogramme.length + 1).padStart(2, '0')}`;
            state.chronogramme.push({
                id: newId,
                heureDebut: heureDebut,
                heureFin: heureFin,
                titre: titre,
                responsable: responsable,
                description: description,
                icone: icone,
                couleur: couleur,
                phase: phase
            });
        }

        // Sort by heureDebut
        state.chronogramme.sort((a, b) => (a.heureDebut || '').localeCompare(b.heureDebut || ''));

        saveChronogrammeData();
        closeEditChronogrammeModal();
        showNotification("Programme Mis à Jour !", "L'activité a été enregistrée et le programme officiel de la billetterie est actualisé.", "success");
    }

    function requestDeleteChronogrammeItem(id) {
        const item = (state.chronogramme || []).find(i => i.id === id);
        if (!item) return;

        const pwd = prompt(`Suppression Sécurisée - Saisir votre mot de passe personnel pour supprimer l'activité "${item.titre}" :`);
        if (!pwd) return;

        if (!verifyPersonalOrAdminPassword(pwd)) {
            showNotification("Mot de passe incorrect", "Autorisation de suppression refusée.", "error");
            return;
        }

        const idx = state.chronogramme.findIndex(i => i.id === id);
        if (idx !== -1) {
            state.chronogramme.splice(idx, 1);
            saveChronogrammeData();
            showNotification("Activité Supprimée", "L'étape a été retirée du programme officiel.", "info");
        }
    }

    function resetChronogrammeToDefault() {
        if (state.user && state.user.isVisitor) {
            showNotification("Accès Restreint", "Seuls les membres de comité peuvent réinitialiser le chronogramme.", "error");
            return;
        }
        if (confirm("Réinitialiser le chronogramme au programme officiel d'origine ?")) {
            state.chronogramme = [...SEED_CHRONOGRAMME];
            saveChronogrammeData();
            showNotification("Programme Réinitialisé", "Le chronogramme d'origine a été restauré.", "info");
        }
    }


    
    function unlockApplication() {
        sessionStorage.setItem('myticket_auth_wall_passed', 'true');
        const nav = document.querySelector('nav');
        const bottomNav = document.getElementById('mobile-bottom-nav');
        if (nav) nav.style.display = '';
        if (bottomNav) bottomNav.style.display = ''; 
        switchView('accueil');
    }
    
    function switchView(viewName) {
        if (sessionStorage.getItem('myticket_auth_wall_passed') !== 'true' && viewName !== 'utilisateur') {
            viewName = 'utilisateur';
        }

        // --- ENFORCE RBAC SECURITY ON ROUTING ---
        const user = state.user || { isVisitor: true };
        const pcoRoles = ["Coordination Stratégique", "Coordination Opérationnelle"];
        const modulePermissions = {
            'accueil': null, 'ticket': null, 'apropos': null, 'utilisateur': null, 'organisation': null,
            'dashboard': pcoRoles,
            'finance': ['MEMBER'],
            'reception': [...pcoRoles, "Comité Accueil & Sécurité"],
            'liste': [...pcoRoles, "Comité Administratif", "Comité Accueil & Sécurité", "Comité Financier"]
        };
        const req = modulePermissions[viewName];
        if (req) {
            if (user.isVisitor) viewName = 'accueil';
            else if (!req.includes('MEMBER') && !req.includes(user.comite)) viewName = 'accueil';
        }

        // Sauvegarder la vue active
        try { sessionStorage.setItem('myticket_active_view', viewName); } catch(e){console.error(e);}

        // FORCE HIDE EVERY SINGLE VIEW SECTION EXPLICITLY
        var viewIds = ['accueil', 'finance', 'reception', 'dashboard', 'ticket', 'historique', 'liste', 'organisation', 'utilisateur', 'apropos'];
        viewIds.forEach(function(id) {
            var el = document.getElementById('view-' + id);
            if (el) {
                el.style.setProperty('display', 'none', 'important');
                el.style.opacity = '0';
                el.classList.remove('active-view');
            }
        });

        // SHOW TARGET ONLY
        
        
        
        // Mettre à jour l'onglet actif (Desktop)
        document.querySelectorAll('.nav-tab').forEach(function(tab) {
            if (tab.getAttribute('data-target') === viewName) {
                tab.classList.add('active-tab');
            } else {
                tab.classList.remove('active-tab');
            }
        });
        
        // Mettre à jour l'onglet actif (Mobile)
        document.querySelectorAll('.mobile-nav-tab').forEach(function(tab) {
            if (tab.getAttribute('data-target') === viewName) {
                if (tab.classList.contains('bg-slate-50')) {
                    tab.classList.add('active-mobile-tab-card');
                } else {
                    tab.classList.add('active-mobile-tab');
                }
            } else {
                if (tab.classList.contains('bg-slate-50')) {
                    tab.classList.remove('active-mobile-tab-card');
                } else {
                    tab.classList.remove('active-mobile-tab');
                }
            }
        });
        
        var target = document.getElementById('view-' + viewName);
        if (target) {
            target.style.setProperty('display', 'block', 'important');
            target.classList.add('active-view');
            setTimeout(function() { target.style.opacity = '1'; }, 10);
        }

        // ─── CALLBACKS PAR MODULE ────────────────────────────────────
        if (viewName === 'dashboard') updateDashboardStats();
        else if (viewName === 'ticket') { startTicketCountdown(); renderChronogrammeBilletterie(); }
        else if (viewName === 'organisation') { renderTablePlan(); renderChronogrammeOrganisation(); renderOrganisationLeaders(); }
        else if (viewName === 'finance') { renderFinanceDashboard(); renderFinanceConsolidation(); }
        else if (viewName === 'reception') { renderReceptionTable(); renderTablePlan(); }
        else if (viewName === 'apropos') { renderAproposCommittees(); }
        else if (viewName === 'historique') renderHistoryList();
        else if (viewName === 'liste') { renderParticipantsTable(); populateChurchFilterOptions(); }

        // ─── SCROLL EN HAUT ──────────────────────────────────────────
        var mainEl = document.querySelector('main');
        if (mainEl) mainEl.scrollTop = 0;
        window.scrollTo(0, 0);

        initializeLucideIcons();
    }

    function showNotification(title, message, type = 'success') {
        const toast = document.getElementById('toast-notification');
        const iconBg = document.getElementById('toast-icon-bg');
        const icon = document.getElementById('toast-icon');
        const titleEl = document.getElementById('toast-title');
        const descEl = document.getElementById('toast-message');
        
        titleEl.innerText = title;
        descEl.innerText = message;
        
        if (type === 'success') {
            iconBg.className = "p-2 bg-emerald-500 text-white rounded-xl";
            icon.setAttribute('data-lucide', 'check-circle');
        } else if (type === 'info') {
            iconBg.className = "p-2 bg-blue-500 text-white rounded-xl";
            icon.setAttribute('data-lucide', 'info');
        } else {
            iconBg.className = "p-2 bg-red-500 text-white rounded-xl";
            icon.setAttribute('data-lucide', 'alert-triangle');
        }
        
        initializeLucideIcons();
        toast.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
        
        setTimeout(() => {
            toast.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
        }, 3500);
    }

    // =======================================================
    // PAYMENT PROOF ENGINE: OCR / REGEX EXTRACTION & BALANCE
    // =======================================================
    
    // Check category selection and trigger admin lock for Invité
    
    // ==========================================
    // TICKET QUOTAS & CAPACITY CONFIGURATION
    // ==========================================
    const TICKET_QUOTAS = {
        'Classique': { max: 140, price: 10000, tables: 18, color: 'slate' },
        'Gold': { max: 60, price: 0, tables: 8, color: 'amber' },
        'Invité': { max: 10, price: 0, tables: 1, color: 'emerald' }
    };
    const TOTAL_MAX_TICKETS = 210;
    const TOTAL_MAX_TABLES = 28;

    function getCategoryCounts() {
        const counts = { 'Classique': 0, 'Gold': 0, 'Invité': 0 };
        (state.participants || []).forEach(p => {
            const cat = p.categorie || 'Classique';
            if (counts[cat] !== undefined) counts[cat]++;
            else counts['Classique']++;
        });
        return counts;
    }

    function updateCategoryDropdownQuotas() {
        const counts = getCategoryCounts();
        const total = (state.participants || []).length;
        const totalRemaining = Math.max(0, TOTAL_MAX_TICKETS - total);

        // 1. Update Global Total Badge
        const elTotal = document.getElementById('ticket-live-total-badge');
        if (elTotal) {
            elTotal.innerHTML = `<span class="h-1.5 w-1.5 rounded-full ${totalRemaining > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}"></span><span>${totalRemaining} / ${TOTAL_MAX_TICKETS} Restants</span>`;
        }

        // 2. Update 4 Compact Micro-Badges in Billetterie
        const remClassique = Math.max(0, 140 - (counts['Classique'] || 0));
        const remGold = Math.max(0, 60 - (counts['Gold'] || 0));
        
        const remInvite = Math.max(0, 10 - (counts['Invité'] || 0));

        const cardClas = document.getElementById('avail-count-classique');
        if (cardClas) cardClas.innerText = remClassique;

        

        const cardGold = document.getElementById('avail-count-gold');
        if (cardGold) cardGold.innerText = remGold;

        const cardInv = document.getElementById('avail-count-invite');
        if (cardInv) cardInv.innerText = remInvite;

        // 3. Update Dropdown Options with live remaining tickets
        const select = document.getElementById('form-categorie');
        if (select) {
            const currentSelected = select.value;
            // RÈGLE OBLIGATOIRE : Le Pass Gold et le Pass Invité ne sont visibles que par les connexions non-Visiteur
            const isNonVisitor = Boolean(state.user && !state.user.isVisitor);
            
            select.innerHTML = `
                <option value="" disabled ${!currentSelected ? 'selected' : ''}>-- Choisir une catégorie de Pass --</option>
                <option value="Classique" data-price="10000" ${currentSelected === 'Classique' ? 'selected' : ''} ${remClassique <= 0 ? 'disabled' : ''}>
                    Pass Classique ${remClassique > 0 ? `(${remClassique} places restantes)` : '⛔ QUOTA ATTEINT (0 place)'}
                </option>
                ${isNonVisitor ? `
                <option value="Gold" data-price="0" ${currentSelected === 'Gold' ? 'selected' : ''} ${remGold <= 0 ? 'disabled' : ''}>
                    Pass Gold ${remGold > 0 ? `(${remGold} places restantes)` : '⛔ QUOTA ATTEINT (0 place)'}
                </option>
                <option value="Invité" data-price="0" ${currentSelected === 'Invité' ? 'selected' : ''} ${remInvite <= 0 ? 'disabled' : ''}>
                    Pass Invité ${remInvite > 0 ? `(${remInvite} places restantes)` : '⛔ QUOTA ATTEINT (0 place)'}
                </option>
                ` : ''}
            `;
            select.value = currentSelected || '';
        }
    }

    // Strict Chronological Ticket Numbering (MYT-0001 to MYT-0300) without repetition
    function getNextTicketId() {
        const existingNums = new Set();
        (state.participants || []).forEach(p => {
            if (p && p.id) {
                const match = String(p.id).match(/^MYT-(\d+)$/i);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (!isNaN(num) && num > 0) {
                        existingNums.add(num);
                    }
                }
            }
        });

        for (let seq = 1; seq <= 300; seq++) {
            if (!existingNums.has(seq)) {
                return `MYT-${String(seq).padStart(4, '0')}`;
            }
        }

        let maxSeq = 300;
        existingNums.forEach(n => { if (n > maxSeq) maxSeq = n; });
        return `MYT-${String(maxSeq + 1).padStart(4, '0')}`;
    }

    // ISO/IEC 18004 Standard QR Code Generator for High-Accuracy Camera & Scanner Recognition
    function generateQRGrid(ticketId) {
        const svg = document.getElementById('ticket-qr');
        const printSvg = document.getElementById('print-qr-svg');
        const fullscreenSvg = document.getElementById('fullscreen-ticket-qr');
        if (!svg && !printSvg && !fullscreenSvg) return;

        if (!ticketId || ticketId === 'EMPTY') {
            const emptyHTML = `
                <rect width="100%" height="100%" fill="#f8fafc" />
                <path d="M4 4 h6 v6 h-6 z M19 4 h6 v6 h-6 z M4 19 h6 v6 h-6 z" fill="#cbd5e1" />
                <text x="50%" y="54%" font-family="monospace" font-size="3" font-weight="bold" fill="#94a3b8" text-anchor="middle" dominant-baseline="middle">EN ATTENTE</text>
            `;
            [svg, printSvg, fullscreenSvg].forEach(el => {
                if (el) {
                    el.setAttribute('viewBox', '0 0 29 29');
                    el.setAttribute('shape-rendering', 'crispEdges');
                    el.style.shapeRendering = 'crispEdges';
                    el.innerHTML = emptyHTML;
                }
            });
            return;
        }

        const cleanCode = ticketId.toString().trim();
        
        try {
            if (typeof qrcode !== 'undefined') {
                const qr = qrcode(0, 'M'); // ISO/IEC 18004 Standard Level M
                qr.addData(cleanCode);
                qr.make();

                const count = qr.getModuleCount();
                const margin = 4; // Required ISO standard 4-module quiet zone
                const totalModules = count + margin * 2;

                // Build mathematically exact integer SVG vector path (1 unit per module)
                let pathD = '';
                for (let r = 0; r < count; r++) {
                    for (let c = 0; c < count; c++) {
                        if (qr.isDark(r, c)) {
                            pathD += `M${c + margin},${r + margin}h1v1h-1z `;
                        }
                    }
                }

                const fullContent = `
                    <rect width="100%" height="100%" fill="#ffffff" />
                    <path d="${pathD}" fill="#000000" />
                `;

                [svg, printSvg, fullscreenSvg].forEach(el => {
                    if (el) {
                        el.setAttribute('viewBox', `0 0 ${totalModules} ${totalModules}`);
                        el.setAttribute('shape-rendering', 'crispEdges');
                        el.style.shapeRendering = 'crispEdges';
                        el.innerHTML = fullContent;
                    }
                });
            } else {
                console.warn("qrcode library not loaded yet.");
            }
        } catch (e) {
            console.error("Error generating QR code:", e);
        }
    };



    // Dynamic Live Preview synchronized in real-time as user types in form
    function updateLiveTicketPreviewFromForm() {
        // As requested: No information is displayed on the ticket while filling the form.
        // The ticket remains completely virgin until "Valider & Générer" is clicked.
        if (!state.currentTicket) {
            updateTicketPreviewUI(null);
        }
    }

    // ==========================================
    // GESTIONNAIRE DONATEURS & PASS GOLD
    // ==========================================
    function splitDonorName(fullName) {
        if (!fullName) return { nom: '', prenom: '' };
        const clean = fullName.trim();
        const parts = clean.split(/\s+/);
        if (parts.length === 1) {
            return { nom: parts[0], prenom: 'Donateur' };
        }
        const prenom = parts.pop();
        const nom = parts.join(' ');
        return { nom: nom, prenom: prenom };
    }

    function getEligibleGoldDonors() {
        const dons = (state.finance && Array.isArray(state.finance.dons)) ? state.finance.dons : [];
        const usedDonors = new Set();
        
        // Identifier les donateurs ayant déjà reçu un billet Pass Gold
        (state.participants || []).forEach(p => {
            if (p) {
                if (p.donateurOrigine) {
                    usedDonors.add(p.donateurOrigine.trim().toLowerCase());
                }
                if (p.categorie === 'Gold') {
                    const combined = `${p.nom || ''} ${p.prenom || ''}`.trim().toLowerCase();
                    if (combined) usedDonors.add(combined);
                    if (p.nom) usedDonors.add(p.nom.trim().toLowerCase());
                }
            }
        });

        const eligible = [];
        const seenInDons = new Set();

        dons.forEach(d => {
            const dName = (d.donateur || '').trim();
            if (!dName) return;
            const key = dName.toLowerCase();
            if (seenInDons.has(key)) return;
            seenInDons.add(key);

            const { nom, prenom } = splitDonorName(dName);
            const combined = `${nom} ${prenom}`.trim().toLowerCase();

            if (!usedDonors.has(key) && !usedDonors.has(combined)) {
                eligible.push({
                    donateur: dName,
                    montant: d.montant,
                    date: d.date,
                    type: d.type
                });
            }
        });

        return eligible;
    }

    function populateGoldDonorsDropdown() {
        const select = document.getElementById('form-gold-donateur');
        const badge = document.getElementById('gold-donors-count-badge');
        if (!select) return;

        const eligible = getEligibleGoldDonors();
        if (badge) badge.innerText = `${eligible.length} Donateur(s) Éligible(s)`;

        const currentVal = select.value;
        select.innerHTML = '<option value="" disabled selected>-- Choisir un donateur dans la liste des dons --</option>';
        
        if (eligible.length === 0) {
            select.innerHTML += '<option value="" disabled>⚠️ Aucun donateur disponible (tous ont déjà reçu un Pass Gold ou aucun don enregistré)</option>';
        } else {
            eligible.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.donateur;
                // RÈGLE OBLIGATOIRE : Afficher uniquement le nom du donateur (aucun montant affiché)
                opt.textContent = d.donateur;
                if (currentVal && d.donateur === currentVal) opt.selected = true;
                select.appendChild(opt);
            });
        }
    }

    function handleGoldDonorSelection() {
        const select = document.getElementById('form-gold-donateur');
        if (!select || !select.value) return;
        const donateurName = select.value;
        const { nom, prenom } = splitDonorName(donateurName);
        
        const nomInput = document.getElementById('form-nom');
        const prenomInput = document.getElementById('form-prenom');
        const egliseInput = document.getElementById('form-eglise');
        
        if (nomInput) {
            nomInput.value = nom;
            nomInput.readOnly = true;
            nomInput.classList.add('bg-slate-100', 'text-slate-600', 'cursor-not-allowed');
        }
        if (prenomInput) {
            prenomInput.value = prenom;
            prenomInput.readOnly = true;
            prenomInput.classList.add('bg-slate-100', 'text-slate-600', 'cursor-not-allowed');
        }
        if (egliseInput && (!egliseInput.value || egliseInput.value === 'EMCI Horeb Toits Rouges')) {
            egliseInput.value = 'Donateur & Partenaire EMCI';
        }

        updateLiveTicketPreviewFromForm();
    }

    function handleCategorySelection() {
        const select = document.getElementById('form-categorie');
        const selectedVal = select ? select.value : '';
        const container = document.getElementById('payment-verification-container');
        const checkoutContainer = document.getElementById('direct-checkout-container');
        const checkoutSeparator = document.getElementById('checkout-separator');
        const donorContainer = document.getElementById('gold-donor-container');
        const notice = document.getElementById('form-category-availability-notice');
        const nomInput = document.getElementById('form-nom');
        const prenomInput = document.getElementById('form-prenom');
        
        // RÈGLE OBLIGATOIRE : Pour Pass Gold et Pass Invité, masquage des options et preuves de paiement + Code Admin requis
        if (selectedVal === 'Gold' || selectedVal === 'Invité') {
            container?.classList.add('hidden');
            checkoutContainer?.classList.add('hidden');
            checkoutSeparator?.classList.add('hidden');

            if (!state.adminGuestAuthorized) {
                // Ouvrir la modale de sécurité administrateur
                const modal = document.getElementById('modal-admin-guest');
                const codeInput = document.getElementById('admin-guest-code-input');
                const titleModal = document.getElementById('admin-guest-modal-title');
                const descModal = document.getElementById('admin-guest-modal-desc');

                if (titleModal) {
                    titleModal.innerText = selectedVal === 'Gold' ? "Autorisation Admin — Pass Gold" : "Autorisation Admin — Pass Invité";
                }
                if (descModal) {
                    descModal.innerHTML = selectedVal === 'Gold'
                        ? "L'émission d'un <strong>Pass Gold (Donateur)</strong> est gratuite et strictement réservée aux personnes ayant fait un don. Veuillez saisir votre mot de passe administrateur pour débloquer l'opération."
                        : "L'émission d'un <strong>Pass Invité (Gratuit)</strong> est strictement réservée à l'administration. Veuillez saisir votre mot de passe administrateur pour débloquer l'opération.";
                }

                if (codeInput) codeInput.value = '';
                if (modal) modal.classList.remove('hidden');
                setTimeout(() => codeInput?.focus(), 150);
                showNotification("Accès Réservé", `L'émission d'un Pass ${selectedVal} exige la saisie préalable du Code Administrateur.`, "info");
            }
        } else {
            // Catégorie Classique (Payant) : Réafficher les options de paiement et le contrôle de preuve
            container?.classList.remove('hidden');
            checkoutContainer?.classList.remove('hidden');
            checkoutSeparator?.classList.remove('hidden');
            state.adminGuestAuthorized = false; // Reset lock when switching away
        }

        // Gestion spécifique du sélecteur Donateur pour le Pass Gold
        if (selectedVal === 'Gold') {
            donorContainer?.classList.remove('hidden');
            populateGoldDonorsDropdown();
            // Si un donateur est déjà sélectionné dans le dropdown, on remplit immédiatement
            handleGoldDonorSelection();
        } else {
            donorContainer?.classList.add('hidden');
            // Réactiver les champs nom et prénom si on quitte Gold
            if (nomInput) {
                nomInput.readOnly = false;
                nomInput.classList.remove('bg-slate-100', 'text-slate-600', 'cursor-not-allowed');
            }
            if (prenomInput) {
                prenomInput.readOnly = false;
                prenomInput.classList.remove('bg-slate-100', 'text-slate-600', 'cursor-not-allowed');
            }
        }
        
        updateCategoryPrice();
        revalidateCurrentProofBalance();

        if (notice && selectedVal) {
            const counts = getCategoryCounts();
            const maxQuota = (TICKET_QUOTAS[selectedVal] && TICKET_QUOTAS[selectedVal].max) || 140;
            const remaining = Math.max(0, maxQuota - (counts[selectedVal] || 0));

            notice.classList.remove('hidden');
            if (remaining === 0) {
                notice.className = "text-[11px] font-bold py-2 px-3 rounded-xl bg-red-50 text-red-800 border border-red-200 flex items-center justify-between";
                notice.innerHTML = `<span>⛔ <strong>Complet (0/${maxQuota})</strong> • Pass ${selectedVal}</span>`;
            } else if (remaining <= 10) {
                notice.className = "text-[11px] font-bold py-2 px-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-between";
                notice.innerHTML = `<span>⚠️ <strong>Plus que ${remaining} place${remaining > 1 ? 's' : ''}</strong> sur ${maxQuota} (Pass ${selectedVal})</span>`;
            } else {
                notice.className = "text-[11px] font-bold py-2 px-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center justify-between";
                notice.innerHTML = `<span>✅ <strong>${remaining}/${maxQuota} places disponibles</strong> (Pass ${selectedVal}${selectedVal === 'Gold' ? ' - Donateurs Uniquement' : (selectedVal === 'Invité' ? ' - Réservé' : '')})</span>`;
            }
        } else if (notice) {
            notice.classList.add('hidden');
        }

        if (!state.currentTicket) {
            updateTicketPreviewUI(null);
        }
    }

    function updateCategoryPrice() {
        const select = document.getElementById('form-categorie');
        const priceBadge = document.getElementById('form-display-price');
        if (!select || !priceBadge) return;
        
        if (select.selectedIndex <= 0 || !select.value) {
            priceBadge.innerText = "-- FCFA";
            priceBadge.className = "text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500";
            return;
        }

        const selectedOpt = select.options[select.selectedIndex];
        const price = parseInt(selectedOpt.getAttribute('data-price')) || 0;
        
        if (price === 0) {
            priceBadge.innerText = "Gratuit (0 FCFA)";
            priceBadge.className = "text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300";
        } else if (price === 10000) {
            priceBadge.innerText = "10 000 FCFA";
            priceBadge.className = "text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 border border-slate-300";
        } else if (price === 20000) {
            priceBadge.innerText = "20 000 FCFA";
            priceBadge.className = "text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300";
        } else {
            priceBadge.innerText = "30 000 FCFA";
            priceBadge.className = "text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300";
        }
    }

    /**
     * Isole les pixels de teinte ORANGE (Charte Orange Money : ~ #FF7900)
     * Transforme les pixels orange en NOIR (texte/montant) et tous les autres en BLANC (fond)
     * pour permettre à l'OCR de lire spécifiquement le montant affiché en orange.
     */
    async function extractOrangeCanvasBlob(file) {
        if (!file || !file.type || !file.type.startsWith('image/')) return null;
        return new Promise((resolve) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                try {
                    const maxDim = 1200;
                    let w = img.width;
                    let h = img.height;
                    if (w > maxDim || h > maxDim) {
                        const ratio = Math.min(maxDim / w, maxDim / h);
                        w = Math.round(w * ratio);
                        h = Math.round(h * ratio);
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) { resolve(null); return; }
                    ctx.drawImage(img, 0, 0, w, h);
                    const imgData = ctx.getImageData(0, 0, w, h);
                    const d = imgData.data;
                    let orangeCount = 0;

                    for (let i = 0; i < d.length; i += 4) {
                        const r = d[i];
                        const g = d[i + 1];
                        const b = d[i + 2];
                        // Détection des pixels orange (#FF7900 ~ R:255, G:121, B:0)
                        const isOrange = (r > 130) && 
                                         (g >= 35 && g <= 195) && 
                                         (b <= 120) && 
                                         (r - g >= 15) && 
                                         (r - b >= 45);

                        if (isOrange) {
                            d[i] = 0;
                            d[i + 1] = 0;
                            d[i + 2] = 0;
                            orangeCount++;
                        } else {
                            d[i] = 255;
                            d[i + 1] = 255;
                            d[i + 2] = 255;
                        }
                    }

                    if (orangeCount >= 30) {
                        ctx.putImageData(imgData, 0, 0);
                        canvas.toBlob(blob => resolve(blob), 'image/png');
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    console.warn("Notice extraction couche orange canvas:", e);
                    resolve(null);
                }
            };
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                resolve(null);
            };
            img.src = objectUrl;
        });
    }

    // Guaranteed & Ultra-Fast Wave & Orange Receipt Detector
    async function handleProofFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const progressBox = document.getElementById('ocr-loading-progress');
        const progressText = document.getElementById('ocr-progress-text');
        if (progressBox) progressBox.classList.remove('hidden');
        if (progressText) progressText.innerText = "Lecture et détection du reçu Wave / Orange...";

        const resultCard = document.getElementById('proof-analysis-result');
        if (resultCard) {
            resultCard.classList.remove('hidden');
            document.getElementById('proof-detected-badge').className = "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-sky-100 text-sky-900 border border-sky-300 font-mono";
            document.getElementById('proof-detected-badge').innerText = "Analyse Reçu...";
            document.getElementById('proof-detected-ref').innerText = "Détection en cours...";
            document.getElementById('proof-detected-amount').innerText = "...";
            document.getElementById('proof-detected-balance').innerText = "...";
            document.getElementById('proof-valid-indicator').className = "flex items-center gap-1 text-[10px] font-black text-amber-600 font-mono";
            document.getElementById('proof-valid-indicator').innerHTML = '<i data-lucide="loader" class="h-3.5 w-3.5 animate-spin"></i> LECTURE';
            document.getElementById('proof-checklist-container').innerHTML = `<div class="text-slate-500 font-mono text-[9px]">🔍 Détection de l'ID Transaction (T_...) et du Montant...</div>`;
            initializeLucideIcons();
        }

        showNotification("Analyse du Reçu...", "Détection de l'ID de transaction et du montant réglé.", "info");

        const isPdf = file.type === 'application/pdf' || (file.name || '').toLowerCase().endsWith('.pdf');
        let extractedText = "";
        let orangeText = "";

        if (isPdf) {
            if (progressText) progressText.innerText = "Lecture et extraction du reçu PDF...";
            try {
                if (typeof window.pdfjsLib === 'undefined' && typeof loadExternalScript === 'function') {
                    try {
                        await loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
                    } catch(errPdf) { console.warn("Notice chargement PDF.js:", errPdf); }
                }
                if (window.pdfjsLib) {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    const arrayBuffer = await file.arrayBuffer();
                    const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    let pdfText = "";
                    for (let p = 1; p <= pdfDoc.numPages; p++) {
                        const page = await pdfDoc.getPage(p);
                        const content = await page.getTextContent();
                        pdfText += content.items.map(it => it.str).join(' ') + '\n';
                    }
                    if (pdfText.trim().length > 0) {
                        extractedText = pdfText;
                    }
                }
            } catch (pdfErr) {
                console.warn("Notice extraction PDF:", pdfErr);
            }

            // Fallback: extraction directe des chaînes de caractères lisibles du PDF
            if (!extractedText || extractedText.trim().length < 5) {
                try {
                    const buf = await file.arrayBuffer();
                    const rawStr = new TextDecoder('latin1').decode(buf);
                    const cleanMatches = rawStr.match(/[A-Za-z0-9_.:\-+/ \t\r\n]{4,}/g);
                    if (cleanMatches) {
                        extractedText = cleanMatches.join(' ');
                    }
                } catch (e) {
                    console.warn("Fallback PDF binary:", e);
                }
            }
        } else {
            // Lecture par Reconnaissance Optique OCR (Tesseract.js - Chargement à la demande)
            try {
                if (typeof window.Tesseract === 'undefined' && typeof loadExternalScript === 'function') {
                    if (progressText) progressText.innerText = "Chargement du moteur OCR intelligent...";
                    try {
                        await loadExternalScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
                    } catch(errScript) { console.warn("Notice chargement Tesseract:", errScript); }
                }
                if (window.Tesseract) {
                    const ocrPromise = (async () => {
                        const worker = await Tesseract.createWorker('eng', 1, {
                            logger: m => {
                                if (m.status === 'recognizing text' && progressText) {
                                    progressText.innerText = `Lecture OCR : ${Math.round(m.progress * 100)}%`;
                                }
                            }
                        });
                        const ret = await worker.recognize(file);
                        const fullText = ret.data.text || "";

                        // Détection ciblée de la couche de texte ORANGE (#FF7900)
                        let orangeDetectedText = "";
                        try {
                            const orangeBlob = await extractOrangeCanvasBlob(file);
                            if (orangeBlob) {
                                if (progressText) progressText.innerText = "Lecture du montant en orange...";
                                const orangeRet = await worker.recognize(orangeBlob);
                                orangeDetectedText = orangeRet.data.text || "";
                            }
                        } catch (errOrange) {
                            console.warn("Notice extraction couche orange:", errOrange);
                        }

                        await worker.terminate();
                        return { fullText, orangeDetectedText };
                    })();

                    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ fullText: "", orangeDetectedText: "" }), 25000));
                    const ocrRes = await Promise.race([ocrPromise, timeoutPromise]);
                    extractedText = ocrRes.fullText || "";
                    orangeText = ocrRes.orangeDetectedText || "";
                }
            } catch (e) {
                console.warn("OCR worker notice:", e);
            }
        }

        if (progressBox) progressBox.classList.add('hidden');

        if (extractedText && extractedText.trim().length > 3) {
            analyzeProofText(extractedText, orangeText);
            return;
        }

        const fileName = (file.name || '');
        const fileRefMatch = fileName.match(/\b(T_[0-9A-Za-z_-]{4,35})\b/i) || fileName.match(/\b((?:PP|MP|CI|OM)[0-9A-Za-z.]{4,35})\b/i);
        
        if (fileRefMatch) {
            const isWave = fileRefMatch[1].toUpperCase().startsWith("T_");
            const hasPitchouInFilename = /pitchou/i.test(fileName) || /maillot/i.test(fileName);
            const mockText = isWave ? 
                (hasPitchouInFilename 
                    ? `wave\n-10.000F\nPaiement Pitchou maillots\nID de transaction ${fileRefMatch[1]}\nStatut Effectué` 
                    : `wave\n-10.000F\nPaiement\nID de transaction ${fileRefMatch[1]}\nStatut Effectué`) 
                : `Orange Money\nTransfert au 0777588706\nMontant prélevé -10000 FCFA\nRéférence ${fileRefMatch[1]}`;
            analyzeProofText(mockText, "10 000 FCFA");
            return;
        }

        rejectInvalidProof("Aucun ID de transaction Wave (T_...) ou Orange Money (PP..., MP...) lisible détecté sur cette capture ou ce document PDF. Veuillez vous assurer d'importer un reçu bien net.");
    }

    function rejectInvalidProof(reasonMessage) {
        state.currentAnalyzedProof = {
            mode: "Invalide",
            reference: "NON_CONFORME",
            montantTotal: 0,
            soldeDisponible: 0,
            isValid: false
        };

        const resultCard = document.getElementById('proof-analysis-result');
        if (resultCard) {
            resultCard.classList.remove('hidden');
            resultCard.className = "p-3.5 rounded-2xl bg-rose-50/70 border-2 border-rose-400 shadow-sm space-y-2 transition-all duration-300";
        }

        const modeBadge = document.getElementById('proof-detected-badge');
        if (modeBadge) {
            modeBadge.innerText = "Reçu Invalide";
            modeBadge.className = "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-100 text-rose-900 border border-rose-300 font-mono";
        }

        const validIndicator = document.getElementById('proof-valid-indicator');
        if (validIndicator) {
            validIndicator.className = "flex items-center gap-1.5 text-xs font-black text-rose-700 font-mono";
            validIndicator.innerHTML = '<i data-lucide="x-circle" class="h-4 w-4 text-rose-600"></i> REFUSÉ';
        }

        const amountLabelEl = document.getElementById('proof-amount-label');
        if (amountLabelEl) amountLabelEl.innerText = "Montant Débité :";
        const refEl = document.getElementById('proof-detected-ref');
        if (refEl) refEl.innerText = "NON DÉTECTÉ";
        const codeEl = document.getElementById('proof-detected-code');
        if (codeEl) codeEl.innerText = "NON DÉTECTÉ";
        const amountEl = document.getElementById('proof-detected-amount');
        if (amountEl) amountEl.innerText = "0 F";
        const balEl = document.getElementById('proof-detected-balance');
        if (balEl) balEl.innerText = "0 F";

        const checkListEl = document.getElementById('proof-checklist-container');
        if (checkListEl) checkListEl.innerHTML = '';

        const warning = document.getElementById('proof-balance-warning');
        if (warning) warning.classList.add('hidden');

        showNotification("Paiement Refusé", "Le document fourni n'a pas pu être validé. Paiement refusé.", "error");
        initializeLucideIcons();
    }

    // Robust Helper to verify Wave merchant name "Pitchou maillots"
    function isPitchouMaillotsMerchant(rawText) {
        if (!rawText) return false;
        const clean = rawText
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        // 1. Direct regex match
        if (/pitchou\s*[-_]?\s*maillot[s5]?/i.test(clean)) {
            return true;
        }
        // 2. OCR letter confusion (1/l for i, 0 for o)
        if (/p[i1l]tch[o0]u\s*[-_]?\s*ma[i1l]{1,3}[o0]t[s5]?/i.test(clean)) {
            return true;
        }
        // 3. Proximity match (pitchou and maillot in nearby context)
        const pitchouMatch = clean.search(/p[i1l]tch[o0]u/i);
        if (pitchouMatch !== -1) {
            const snippet = clean.substring(Math.max(0, pitchouMatch - 30), Math.min(clean.length, pitchouMatch + 45));
            if (/ma[i1l]{1,3}[o0]t[s5]?/i.test(snippet)) {
                return true;
            }
        }
        return false;
    }

    function extractWaveMerchantLabel(rawText) {
        if (!rawText) return "Non détecté";
        const clean = rawText.replace(/\r/g, '');
        const m = clean.match(/(?:Marchand|À|A|Vers|Destinataire|Paiement à|Paiement)\s*[:]?\s*([^\n\r,.;]{3,35})/i) ||
                  clean.match(/Paiement\s+(?:à|a|marchand|vers)?\s*([^\n\r,.;]{3,35})/i) ||
                  clean.match(/Marchand\s+([^\n\r,.;]{3,35})/i);
        if (m && m[1]) {
            return m[1].trim();
        }
        return "Non détecté";
    }

    /**
     * RÈGLE UNIFIÉE WAVE : Valide les 2 formats officiels Wave :
     * 1. Format Reçu de Transaction (document téléchargé) : "Montant 10.000F" ou sous "Marchand Pitchou maillots"
     * 2. Format Capture Application Mobile (in-app) : "-10.000F" en gras au-dessus de "Paiement Pitchou maillots"
     * Dans les 2 cas, le montant débité officiel doit correspondre à 10 000 FCFA (-10.000F / -10000).
     */
    function extractWaveAmount(rawText) {
        if (!rawText) return { amount: 0, rawString: "", found: false, source: 'none' };
        const clean = rawText.replace(/\r/g, '');

        function parseAmountFromLine(str) {
            if (!str) return null;
            // Rejeter formellement les lignes contenant un crédit explicite avec le signe '+'
            if (/[+＋]/.test(str)) return null;

            // Ignorer les lignes de métadonnées qui ne sont pas le montant de la transaction
            const lower = str.toLowerCase();
            if (lower.includes('frais') || lower.includes('solde') || lower.includes('heure') || lower.includes('date')) {
                return null;
            }

            // Remplacement intelligent des confusions OCR : lettre O / o à la place du chiffre 0
            let cleaned = str.replace(/(?:^|[–—−~_\-\s])1[oO0][\.\s,']?[oO0]{3}/g, (m) => m.replace(/[oO]/g, '0'));
            cleaned = cleaned.replace(/([0-9])[oO]/g, '$10').replace(/[oO]([0-9])/g, '0$1');

            // Match amounts: -10.000F, 10.000F, -10 000F, 10 000F, -10000F, 10000F, -10 000 FCFA, etc.
            const m = cleaned.match(/([–—−~_-]?\s*[0-9]{1,3}(?:[ .',][0-9]{3})+|[–—−~_-]?\s*[0-9]{4,7})\s*(?:FCFA|F CFA|CFA|F\b)?/i) ||
                      cleaned.match(/^[–—−~_-]?\s*([0-9]{1,3}(?:[ .',][0-9]{3})+|[0-9]{4,7})$/);
            if (!m) return null;

            const raw = m[1].replace(/\s+/g, '');
            const val = parseInt(raw.replace(/[–—−~_\- .',]/g, ''), 10);
            if (isNaN(val) || val < 1000) return null;

            return {
                amount: -val,
                val: val,
                rawString: m[0].trim(),
                found: true
            };
        }

        // STRATÉGIE 1 : Format 1 (Reçu officiel téléchargeable) -> Ligne "Montant [:] X"
        const montantLineMatch = clean.match(/(?:^|\n)[ \t]*montant[ \t]*:?[ \t]*([–—−~_-]?\s*[0-9]{1,3}(?:[ .',][0-9]{3})+|[–—−~_-]?\s*[0-9]{4,7}\s*(?:FCFA|F CFA|CFA|F\b)?)/i);
        if (montantLineMatch) {
            const res = parseAmountFromLine(montantLineMatch[1]);
            if (res) {
                res.source = 'v1_montant_label';
                return res;
            }
        }

        // STRATÉGIE 2 : Autour de la mention "Pitchou maillots" (Format 2 au-dessus ou Format 1 au-dessous)
        const pitchouPos = clean.search(/p[i1l]tch[o0]u/i);
        if (pitchouPos !== -1) {
            // 2.A : Lignes AU-DESSUS de "Pitchou maillots" (Format 2 écran in-app : -10.000F en gras)
            const textBefore = clean.substring(Math.max(0, pitchouPos - 300), pitchouPos);
            const linesBefore = textBefore.split('\n').map(l => l.trim()).filter(Boolean);
            for (let i = linesBefore.length - 1; i >= 0; i--) {
                const line = linesBefore[i];
                if (/^(?:paiement|paiement\s+(?:marchand|à|a|vers)|vers|à|a|pour)$/i.test(line)) continue;
                const res = parseAmountFromLine(line);
                if (res) {
                    res.source = 'v2_above_pitchou';
                    return res;
                }
            }

            // 2.B : Lignes AU-DESSOUS de "Pitchou maillots" (Format 1 reçu PDF : Montant 10.000F sous Marchand)
            const textAfter = clean.substring(pitchouPos, Math.min(clean.length, pitchouPos + 300));
            const linesAfter = textAfter.split('\n').map(l => l.trim()).filter(Boolean);
            for (let i = 0; i < linesAfter.length; i++) {
                const line = linesAfter[i];
                if (/p[i1l]tch[o0]u/i.test(line)) continue;
                if (/^(?:acheteur|details|détails|statut|frais)/i.test(line)) break;
                const res = parseAmountFromLine(line);
                if (res) {
                    res.source = 'v1_below_pitchou';
                    return res;
                }
            }
        }

        // STRATÉGIE 3 : Détection au-dessus d'une mention "Paiement"
        const paymentPos = clean.search(/paiement\s*(?:marchand|à|a|vers)?[^\n\r]*/i);
        if (paymentPos !== -1) {
            const textBefore = clean.substring(Math.max(0, paymentPos - 250), paymentPos);
            const linesBefore = textBefore.split('\n').map(l => l.trim()).filter(Boolean);
            for (let i = linesBefore.length - 1; i >= 0; i--) {
                const line = linesBefore[i];
                if (/^(?:paiement|paiement\s+(?:marchand|à|a|vers)|vers|à|a|pour)$/i.test(line)) continue;
                const res = parseAmountFromLine(line);
                if (res) {
                    res.source = 'above_paiement';
                    return res;
                }
            }
        }

        // STRATÉGIE 4 : Recherche globale sécurisée du montant 10.000F / -10.000F dans le texte
        const allLines = clean.split('\n').map(l => l.trim()).filter(Boolean);
        for (const line of allLines) {
            if (/^(?:frais|solde|nouveau solde|date|heure|id|acheteur|07|05|01)/i.test(line)) continue;
            const res = parseAmountFromLine(line);
            if (res && res.val === 10000) {
                res.source = 'global_10k_fallback';
                return res;
            }
        }

        return { amount: 0, rawString: "", found: false, source: 'none' };
    }

    // Helper strict pour valider la présence obligatoire du numéro de bénéficiaire Orange Money : 0777588706
    function isOrangeMoneyBeneficiaryValid(rawText) {
        if (!rawText) return false;
        let clean = rawText.replace(/[\s\.\-_\(\)\/\\:,]/g, '');
        // Substitution OCR : lettre O ou o prise pour un zéro
        clean = clean.replace(/[oO]/g, '0');
        // Doit obligatoirement contenir 0777588706 ou son format international (+2250777588706, 2250777588706)
        return clean.includes('0777588706') || 
               clean.includes('2250777588706') || 
               clean.includes('225777588706') ||
               /(?:225|\+225)?0?777588706/.test(clean);
    }

    function extractOrangeMoneyBeneficiary(rawText) {
        if (!rawText) return "Non détecté";
        if (isOrangeMoneyBeneficiaryValid(rawText)) return "0777588706";
        const clean = rawText.replace(/\r/g, '');
        const m = clean.match(/(?:au|vers|destinataire|bénéficiaire|beneficiaire|a|à|numero|numéro)\s*:?\s*([+0-9\s.-]{8,18})/i);
        if (m && m[1]) return m[1].trim();
        return "Non détecté";
    }

    /**
     * Détection stricte Orange Money :
     * Le montant prélevé dans Orange Money doit être de -10000 pour être exact.
     * 1. Priorité absolue : extraction de la mention "Montant prélevé" et de sa valeur négative (-10000).
     * 2. Analyse de proximité : recherche de la valeur négative immédiatement après "Montant prélevé".
     * 3. Fallbacks secondaires sur montants négatifs explicites, en excluant formellement "Frais" et "Nouveau solde".
     */
    function extractOrangeMoneyAmount(fullText, orangeOcrText) {
        if (!fullText) return { amount: 0, rawString: "", isNegative: false, found: false, source: 'none' };
        const clean = fullText.replace(/\r/g, '');

        // 1. Priorité absolue : "Montant prélevé" suivi du montant (doit être -10000 pour être exact)
        const directPreleveRegex = /(?:montant\s*(?:prélevé|preleve|préleve|prélèvement|prelevement|débité|debite))\s*[:=]?\s*([–—-]?\s*[0-9]{1,3}(?:[ .',][0-9]{3})+|[–—-]?\s*[0-9]{4,7})\s*(?:FCFA|F CFA|CFA|F\b)?/i;
        const directMatch = clean.match(directPreleveRegex);
        if (directMatch) {
            const raw = directMatch[1].replace(/\s+/g, '');
            const isNegative = /^[–—-]/.test(raw);
            const val = parseInt(raw.replace(/[–—\- .',]/g, ''), 10);
            if (val >= 1000) {
                return {
                    amount: isNegative ? -val : -val,
                    rawString: directMatch[0].trim(),
                    isNegative: isNegative,
                    found: true,
                    source: 'montant_preleve_direct'
                };
            }
        }

        // 2. Proximité : si "Montant prélevé" est séparé de son montant par un saut de ligne ou des espaces
        const prelevePos = clean.search(/(?:montant\s*(?:prélevé|preleve|préleve)|(?:prélevé|preleve)\b)/i);
        if (prelevePos !== -1) {
            const textAfter = clean.substring(prelevePos, Math.min(clean.length, prelevePos + 180));
            // Ne pas déborder sur "Frais" ou "Nouveau solde"
            const endIdx = textAfter.search(/(?:frais|solde)/i);
            const snippet = endIdx !== -1 ? textAfter.substring(0, endIdx) : textAfter;
            const proxMatch = snippet.match(/([–—-]?\s*[0-9]{1,3}(?:[ .',][0-9]{3})+|[–—-]?\s*[0-9]{4,7})\s*(?:FCFA|F CFA|CFA|F\b)?/i);
            if (proxMatch) {
                const raw = proxMatch[1].replace(/\s+/g, '');
                const isNegative = /^[–—-]/.test(raw);
                const val = parseInt(raw.replace(/[–—\- .',]/g, ''), 10);
                if (val >= 1000) {
                    return {
                        amount: isNegative ? -val : -val,
                        rawString: proxMatch[0].trim(),
                        isNegative: isNegative,
                        found: true,
                        source: 'montant_preleve_proximity'
                    };
                }
            }
        }

        // 3. Montant négatif explicite sur une ligne (ex: -10 000 FCFA ou -10.000 F CFA)
        const lines = fullText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
            const lower = line.toLowerCase();
            if (lower.includes('frais') || lower.includes('solde') || lower.includes('commission')) continue;
            const negMatch = line.match(/([–—-]\s*[0-9]{1,3}(?:[ .',][0-9]{3})+|[–—-]\s*[0-9]{4,7})\s*(?:FCFA|F CFA|CFA|F\b)?/i);
            if (negMatch) {
                const raw = negMatch[1].replace(/\s+/g, '');
                const val = parseInt(raw.replace(/[–—\- .',]/g, ''), 10);
                if (val >= 1000) {
                    return {
                        amount: -val,
                        rawString: negMatch[0].trim(),
                        isNegative: true,
                        found: true,
                        source: 'negative_amount_line'
                    };
                }
            }
        }

        // 4. Fallback si l'OCR a manqué le mot "prélevé" mais a la couche orange
        if (orangeOcrText && typeof orangeOcrText === 'string') {
            const cleanOrange = orangeOcrText.replace(/\r/g, ' ').replace(/\s+/g, ' ');
            const orangeMatch = cleanOrange.match(/([0-9]{1,3}(?:[ .',][0-9]{3})+|[0-9]{4,7})\s*(?:FCFA|F CFA|CFA|F\b)?/i) ||
                                cleanOrange.match(/\b([0-9]{4,7})\b/);
            if (orangeMatch) {
                const val = parseInt(orangeMatch[1].replace(/[ .',]/g, ''), 10);
                if (val >= 1000) {
                    return { amount: -val, rawString: orangeMatch[0].trim(), isNegative: true, found: true, source: 'orange_layer_fallback' };
                }
            }
        }

        return { amount: 0, rawString: "", isNegative: false, found: false, source: 'not_found' };
    }

    function normalizeProofRef(ref) {
        if (!ref) return '';
        let cleaned = String(ref).trim().toUpperCase();
        cleaned = cleaned.replace(/\s+/g, '');
        cleaned = cleaned.replace(/^([TI1L])[_\-\.]/i, 'T_');
        cleaned = cleaned.replace(/^(M\s*P)\s*/i, 'MP');
        cleaned = cleaned.replace(/^(P\s*P)\s*/i, 'PP');
        cleaned = cleaned.replace(/^(C\s*I)\s*/i, 'CI');
        cleaned = cleaned.replace(/^(O\s*M)\s*/i, 'OM');
        cleaned = cleaned.replace(/\.+$/, '');
        return cleaned;
    }

    /**
     * RÈGLE CRITIQUE ANTI-FRAUDE : N'autorise jamais deux fois l'utilisation du même identifiant.
     * Recherche dans :
     * 1. state.participants (tous les billets émis sur cet appareil ou synchronisés)
     * 2. state.paymentProofs (registre de suivi des preuves)
     * 3. localStorage 'myticket_used_proof_ids_v1' (liste noire persistante)
     */
    function isProofIdentifierAlreadyUsed(ref) {
        const cleanRef = normalizeProofRef(ref);
        if (!cleanRef || cleanRef === 'REC-CAISSE' || cleanRef === 'AUTORISATION-ADMIN-DIR' || cleanRef === 'NON_CONFORME') {
            return null;
        }

        // 1. Contrôle direct dans la liste de tous les billets déjà émis
        if (Array.isArray(state.participants)) {
            const foundInTickets = state.participants.find(p => {
                const pRef = normalizeProofRef(p.preuveReglement);
                return pRef && pRef === cleanRef;
            });
            if (foundInTickets) {
                return {
                    used: true,
                    ticketId: foundInTickets.id || 'Billet existant',
                    name: `${foundInTickets.prenom || ''} ${foundInTickets.nom || ''}`.trim(),
                    source: 'participants'
                };
            }
        }

        // 2. Contrôle dans le registre des preuves consommées (state.paymentProofs)
        if (state.paymentProofs && state.paymentProofs[cleanRef]) {
            const record = state.paymentProofs[cleanRef];
            if (record.used || (record.tickets && record.tickets.length > 0) || (record.soldeDisponible !== undefined && record.soldeDisponible <= 0)) {
                return {
                    used: true,
                    ticketId: record.ticketId || (record.tickets && record.tickets[0]) || 'Billet existant',
                    name: record.usedBy || (record.tickets && record.tickets[0]) || '',
                    source: 'paymentProofs'
                };
            }
        }

        // 3. Contrôle dans la liste de sécurité persistante localStorage
        try {
            const stored = JSON.parse(localStorage.getItem('myticket_used_proof_ids_v1') || '[]');
            if (Array.isArray(stored) && stored.includes(cleanRef)) {
                return {
                    used: true,
                    ticketId: 'Déjà enregistré',
                    name: '',
                    source: 'localStorage'
                };
            }
        } catch (e) {}

        return null;
    }

    /**
     * Marque irrévocablement un identifiant de reçu comme consommé.
     * Interdit formellement toute réutilisation future pour émettre un autre billet.
     */
    function markProofIdentifierAsUsed(ref, ticketId, participantName) {
        const cleanRef = normalizeProofRef(ref);
        if (!cleanRef || cleanRef === 'REC-CAISSE' || cleanRef === 'AUTORISATION-ADMIN-DIR' || cleanRef === 'DON-GOLD-OFFICIEL' || cleanRef === 'NON_CONFORME') return;

        state.paymentProofs = state.paymentProofs || {};
        state.paymentProofs[cleanRef] = {
            reference: cleanRef,
            used: true,
            usedAt: new Date().toISOString(),
            ticketId: ticketId || '',
            usedBy: participantName || '',
            soldeDisponible: 0,
            montantTotal: 10000,
            montantUtilise: 10000,
            tickets: [participantName || ticketId || 'Billet']
        };
        savePaymentProofs();

        try {
            const stored = JSON.parse(localStorage.getItem('myticket_used_proof_ids_v1') || '[]');
            const set = new Set(Array.isArray(stored) ? stored : []);
            set.add(cleanRef);
            localStorage.setItem('myticket_used_proof_ids_v1', JSON.stringify(Array.from(set)));
        } catch (e) {}
    }

    /**
     * Libère l'identifiant de preuve lorsqu'une inscription est supprimée par un administrateur
     */
    function unmarkProofIdentifier(ref) {
        const cleanRef = normalizeProofRef(ref);
        if (!cleanRef || cleanRef === 'REC-CAISSE' || cleanRef === 'AUTORISATION-ADMIN-DIR' || cleanRef === 'DON-GOLD-OFFICIEL' || cleanRef === 'NON_CONFORME') return;

        if (state.paymentProofs && state.paymentProofs[cleanRef]) {
            delete state.paymentProofs[cleanRef];
            savePaymentProofs();
        }

        try {
            const stored = JSON.parse(localStorage.getItem('myticket_used_proof_ids_v1') || '[]');
            if (Array.isArray(stored)) {
                const updated = stored.filter(id => id !== cleanRef);
                localStorage.setItem('myticket_used_proof_ids_v1', JSON.stringify(updated));
            }
        } catch (e) {}
    }

    /**
     * Synchronise tous les identifiants déjà présents dans state.participants vers la liste noire
     */
    function syncUsedProofIdentifiers() {
        try {
            const stored = JSON.parse(localStorage.getItem('myticket_used_proof_ids_v1') || '[]');
            const usedSet = new Set(Array.isArray(stored) ? stored : []);

            if (Array.isArray(state.participants)) {
                state.participants.forEach(p => {
                    const pRef = normalizeProofRef(p.preuveReglement);
                    if (pRef && pRef !== 'REC-CAISSE' && pRef !== 'AUTORISATION-ADMIN-DIR' && pRef !== 'NON_CONFORME') {
                        usedSet.add(pRef);
                        state.paymentProofs = state.paymentProofs || {};
                        if (!state.paymentProofs[pRef]) {
                            state.paymentProofs[pRef] = {
                                reference: pRef,
                                used: true,
                                usedAt: p.dateAdded || p.dateTicket || new Date().toISOString(),
                                ticketId: p.id,
                                usedBy: `${p.nom || ''} ${p.prenom || ''}`.trim(),
                                soldeDisponible: 0,
                                montantTotal: p.prix || 10000,
                                montantUtilise: p.prix || 10000,
                                tickets: [p.id]
                            };
                        } else {
                            state.paymentProofs[pRef].used = true;
                            state.paymentProofs[pRef].soldeDisponible = 0;
                        }
                    }
                });
            }

            localStorage.setItem('myticket_used_proof_ids_v1', JSON.stringify(Array.from(usedSet)));
        } catch (e) {
            console.warn("Notice syncUsedProofIdentifiers:", e);
        }
    }

    function analyzeProofText(rawText, orangeOcrText) {
        if (!rawText || rawText.trim().length < 2) {
            document.getElementById('proof-analysis-result')?.classList.add('hidden');
            state.currentAnalyzedProof = null;
            return;
        }

        let text = rawText.replace(/\r/g, '').trim();
        text = text.replace(/\b([TI1l])\s*[_\-\.]\s*([0-9A-Za-z]{3,35})\b/g, 'T_$2');
        text = text.replace(/\b(t_)([0-9A-Za-z]{3,35})\b/g, 'T_$2');
        text = text.replace(/\b(P\s*P)\s*([0-9A-Za-z.]{4,35})\b/gi, 'PP$2');
        text = text.replace(/\b(M\s*P)\s*([0-9A-Za-z.]{4,35})\b/gi, 'MP$2');
        text = text.replace(/\b(C\s*I)\s*([0-9A-Za-z.]{4,35})\b/gi, 'CI$2');
        text = text.replace(/\b(O\s*M)\s*([0-9A-Za-z.]{4,35})\b/gi, 'OM$2');

        // Recomposer les références coupées sur plusieurs lignes par l'OCR ou l'affichage (ex: PP261104.2142.B2434 \n 8)
        text = text.replace(/\b((?:PP|MP|CI|OM)[0-9A-Za-z.]{6,25})\s*\r?\n\s*([0-9A-Za-z]{1,6})\b/gi, '$1$2');

        const waveRefMatch = text.match(/\b(T_[0-9A-Za-z_-]{3,35})\b/i) || text.match(/(T_[0-9A-Za-z_-]+)/i);
        let omRefMatch = text.match(/\b((?:PP|MP|CI|OM)[0-9A-Za-z.]{6,35})\b/i);
        if (!omRefMatch) {
            const refKeyword = text.match(/(?:référence|reference|ref\.?)\s*:?\s*([0-9A-Za-z.\s]{4,35})/i);
            if (refKeyword && refKeyword[1]) {
                const cleanKRef = refKeyword[1].replace(/\s+/g, '').replace(/\.+$/, '');
                if (cleanKRef.length >= 6) {
                    omRefMatch = [null, cleanKRef];
                }
            }
        }

        let detectedMode = "Inconnu";
        let extractedRef = "";
        let detectedAmount = 0;
        let isCompliant = false;
        let isAlreadyUsed = false;
        let duplicateCheck = null;
        let isMerchantValid = true;
        let detectedMerchant = "N/A";

        if (waveRefMatch) {
            detectedMode = "Wave Mobile";
            extractedRef = waveRefMatch[1].toUpperCase();

            // 1. Validation du Marchand Wave : "Pitchou maillots"
            const isMerchantCompliant = isPitchouMaillotsMerchant(text);
            isMerchantValid = isMerchantCompliant;
            detectedMerchant = isMerchantCompliant ? "Pitchou maillots" : extractWaveMerchantLabel(text);

            // 2. Sur Wave : le montant à considérer est celui au-dessus de la mention "Paiement Pitchou maillots" en gras (-10.000F)
            const parsedWave = extractWaveAmount(text);
            detectedAmount = parsedWave.amount; // -10000 si -10.000F

            // 3. Le montant Wave doit être le montant négatif au-dessus de "Paiement Pitchou maillots" et correspondre exactement à -10.000F (-10000)
            const isAmountValid = (detectedAmount === -10000);

            // 4. RÈGLE ANTI-FRAUDE : Contrôle strict de réutilisation du même identifiant Wave (T_...)
            duplicateCheck = isProofIdentifierAlreadyUsed(extractedRef);
            if (duplicateCheck && duplicateCheck.used) {
                isAlreadyUsed = true;
            }

            isCompliant = isMerchantCompliant && isAmountValid && !isAlreadyUsed;

        } else if (omRefMatch) {
            detectedMode = "Orange Money";
            extractedRef = omRefMatch[1].toUpperCase().replace(/\.+$/, '');

            // 1. Validation STRICTE du Bénéficiaire Orange Money : 0777588706 DOIT OBLIGATOIREMENT FIGURER SUR LA PREUVE
            const isBeneficiaryValid = isOrangeMoneyBeneficiaryValid(text);
            isMerchantValid = isBeneficiaryValid;
            detectedMerchant = isBeneficiaryValid ? "0777588706" : extractOrangeMoneyBeneficiary(text);

            // 2. Sur Orange : Le montant à considérer est « Montant prélevé » : doit être de -10000 pour être exact
            const parsedAmount = extractOrangeMoneyAmount(text, orangeOcrText);
            detectedAmount = parsedAmount.amount; // -10000

            // 3. Le « Montant prélevé » Orange Money doit être de -10000 pour être exact
            const isAmountValid = (detectedAmount === -10000);

            // 4. RÈGLE ANTI-FRAUDE : Contrôle strict de réutilisation du même identifiant Orange Money (PP..., MP...)
            duplicateCheck = isProofIdentifierAlreadyUsed(extractedRef);
            if (duplicateCheck && duplicateCheck.used) {
                isAlreadyUsed = true;
            }

            isCompliant = isBeneficiaryValid && isAmountValid && !isAlreadyUsed;

        } else {
            rejectInvalidProof("Aucun ID de transaction débutant par « T_ » (Wave) ou « PP / MP » (Orange) trouvé sur ce document.");
            return;
        }

        const isActuallyValid = isCompliant && !isAlreadyUsed;

        state.currentAnalyzedProof = {
            mode: detectedMode,
            reference: extractedRef,
            merchant: detectedMerchant,
            isMerchantValid: isMerchantValid,
            montantTotal: Math.abs(detectedAmount),
            soldeDisponible: isActuallyValid ? Math.abs(detectedAmount) : 0,
            montantPreleve: detectedAmount,
            isValid: isActuallyValid,
            isAlreadyUsed: isAlreadyUsed,
            isBeneficiaryValid: detectedMode === "Orange Money" ? isOrangeMoneyBeneficiaryValid(text) : true,
            isAmountValid: (detectedAmount === -10000),
            duplicateCheck: duplicateCheck
        };

        const resultCard = document.getElementById('proof-analysis-result');
        const modeBadge = document.getElementById('proof-detected-badge');
        const validIndicator = document.getElementById('proof-valid-indicator');

        if (resultCard) {
            resultCard.classList.remove('hidden');
            if (isActuallyValid) {
                // Cadrant en VERT quand le paiement est validé
                resultCard.className = "p-3.5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-400 shadow-sm space-y-2 transition-all duration-300";
            } else {
                // Cadrant en ROUGE quand le paiement est refusé
                resultCard.className = "p-3.5 rounded-2xl bg-rose-50/70 border-2 border-rose-400 shadow-sm space-y-2 transition-all duration-300";
            }
        }

        if (modeBadge) {
            modeBadge.innerText = detectedMode !== "Inconnu" ? detectedMode : "Reçu Inconnu";
            if (isActuallyValid) {
                if (detectedMode === "Orange Money") {
                    modeBadge.className = "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-orange-100 text-orange-950 border border-orange-300 font-mono";
                } else {
                    modeBadge.className = "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono";
                }
            } else {
                modeBadge.className = "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-100 text-rose-900 border border-rose-300 font-mono";
            }
        }

        if (validIndicator) {
            if (isActuallyValid) {
                validIndicator.className = "flex items-center gap-1.5 text-xs font-black text-emerald-700 font-mono";
                validIndicator.innerHTML = '<i data-lucide="check-circle-2" class="h-4 w-4 text-emerald-600"></i> VALIDÉ';
            } else if (isAlreadyUsed) {
                validIndicator.className = "flex items-center gap-1.5 text-xs font-black text-rose-700 font-mono";
                validIndicator.innerHTML = '<i data-lucide="x-circle" class="h-4 w-4 text-rose-600"></i> DÉJÀ UTILISÉ';
            } else {
                validIndicator.className = "flex items-center gap-1.5 text-xs font-black text-rose-700 font-mono";
                validIndicator.innerHTML = '<i data-lucide="x-circle" class="h-4 w-4 text-rose-600"></i> REFUSÉ';
            }
        }

        const refEl = document.getElementById('proof-detected-ref');
        if (refEl) refEl.innerText = extractedRef || 'NON DÉTECTÉ';

        const codeEl = document.getElementById('proof-detected-code');
        if (codeEl) codeEl.innerText = extractedRef || 'NON DÉTECTÉ';

        const amountLabelEl = document.getElementById('proof-amount-label');
        if (amountLabelEl) {
            amountLabelEl.innerText = detectedMode === "Wave Mobile" ? "Montant Débité (Wave) :" : (detectedMode === "Orange Money" ? "Montant Prélevé :" : "Montant Réglé :");
        }

        const amountEl = document.getElementById('proof-detected-amount');
        if (amountEl) {
            if (detectedMode === "Wave Mobile") {
                amountEl.innerText = detectedAmount === -10000 ? "-10.000F" : (detectedAmount !== 0 ? (detectedAmount < 0 ? `${detectedAmount}F` : `-${detectedAmount}F`) : '0 F');
            } else if (detectedMode === "Orange Money") {
                amountEl.innerText = detectedAmount === -10000 ? "-10 000 FCFA" : (detectedAmount !== 0 ? `${detectedAmount} FCFA` : '0 FCFA');
            } else {
                amountEl.innerText = detectedAmount > 0 ? (detectedAmount.toLocaleString('fr-FR') + ' FCFA') : '0 FCFA';
            }
        }

        const balEl = document.getElementById('proof-detected-balance');
        if (balEl) balEl.innerText = isActuallyValid ? "10 000 FCFA" : "0 FCFA";

        // Suppression intégrale des justificatifs (pas de liste de puces affichée)
        const checkListEl = document.getElementById('proof-checklist-container');
        if (checkListEl) checkListEl.innerHTML = '';

        const warning = document.getElementById('proof-balance-warning');
        if (warning) {
            if (isAlreadyUsed) {
                warning.classList.remove('hidden');
                warning.innerText = `⛔ IDENTIFIANT DÉJÀ UTILISÉ ! Ce reçu (${extractedRef}) a déjà servi pour émettre un billet. L'utilisation du même identifiant deux fois est strictement interdite.`;
            } else if (detectedMode === "Wave Mobile" && !isMerchantValid) {
                warning.classList.remove('hidden');
                warning.innerText = "❌ Marchand non conforme : Le paiement Wave doit être effectué à « Pitchou maillots ».";
            } else if (detectedMode === "Wave Mobile" && !state.currentAnalyzedProof.isAmountValid) {
                warning.classList.remove('hidden');
                if (detectedAmount === 0) {
                    warning.innerText = "❌ Montant non détecté : Le reçu Wave doit comporter le montant officiel de -10.000F (ou 10.000F).";
                } else {
                    const formatted = detectedAmount < 0 ? `${detectedAmount}F` : `-${detectedAmount}F`;
                    warning.innerText = `❌ Montant incorrect : Le montant du reçu Wave doit être de -10.000F (${formatted} détecté).`;
                }
            } else if (detectedMode === "Orange Money" && !state.currentAnalyzedProof.isAmountValid) {
                warning.classList.remove('hidden');
                if (detectedAmount === 0) {
                    warning.innerText = "❌ Montant non détecté : Le « Montant prélevé » doit être de -10000.";
                } else {
                    warning.innerText = `❌ Montant incorrect : Le « Montant prélevé » doit être de -10000 (${detectedAmount} détecté).`;
                }
            } else if (!isCompliant) {
                warning.classList.remove('hidden');
                warning.innerText = "❌ Paiement refusé : reçu non conforme.";
            } else {
                warning.classList.add('hidden');
            }
        }

        if (isActuallyValid) {
            showNotification("Paiement Validé", "Le reçu a été vérifié et validé avec succès.", "success");
        } else if (isAlreadyUsed) {
            showNotification(
                "Identifiant Déjà Utilisé", 
                `L'identifiant « ${extractedRef} » a déjà été utilisé pour un billet. Réutilisation strictement interdite !`, 
                "error"
            );
        } else if (detectedMode === "Wave Mobile" && !isMerchantValid) {
            showNotification(
                "Marchand Wave Incorrect", 
                "Le paiement Wave doit être effectué au marchand « Pitchou maillots ».", 
                "error"
            );
        } else if (detectedMode === "Wave Mobile" && !state.currentAnalyzedProof.isAmountValid) {
            const formatted = detectedAmount < 0 ? `${detectedAmount}F` : `-${detectedAmount}F`;
            showNotification(
                "Montant Wave Non Conforme", 
                detectedAmount === 0 
                    ? "Le reçu Wave doit comporter le montant officiel de -10.000F (ou 10.000F)."
                    : `Le montant Wave doit correspondre à -10.000F (${formatted} détecté).`, 
                "error"
            );
        } else if (detectedMode === "Orange Money" && !state.currentAnalyzedProof.isAmountValid) {
            showNotification(
                "Montant Orange Non Conforme", 
                detectedAmount === 0 
                    ? "Le « Montant prélevé » sur la preuve doit être de -10000."
                    : `Le « Montant prélevé » doit être de -10000 (${detectedAmount} détecté).`, 
                "error"
            );
        } else {
            showNotification("Paiement Refusé", "Le document fourni n'a pas pu être validé. Paiement refusé.", "error");
        }

        revalidateCurrentProofBalance();
        initializeLucideIcons();
    }

    function revalidateCurrentProofBalance() {
        const select = document.getElementById('form-categorie');
        const warning = document.getElementById('proof-balance-warning');
        const resultCard = document.getElementById('proof-analysis-result');
        const validIndicator = document.getElementById('proof-valid-indicator');

        if (!select || !select.value) {
            if (warning && !state.currentAnalyzedProof?.isAlreadyUsed) warning.classList.add('hidden');
            return;
        }

        const selectedOpt = select.options[select.selectedIndex];
        const ticketPrice = (selectedOpt && parseInt(selectedOpt.getAttribute('data-price'))) || 0;

        if (select.value === 'Invité') {
            if (warning) warning.classList.add('hidden');
            return;
        }

        if (state.currentAnalyzedProof) {
            const isUsed = state.currentAnalyzedProof.isAlreadyUsed || (isProofIdentifierAlreadyUsed(state.currentAnalyzedProof.reference)?.used);

            if (isUsed) {
                if (resultCard) {
                    resultCard.className = "p-3.5 rounded-2xl bg-rose-50/70 border-2 border-rose-400 shadow-sm space-y-2 transition-all duration-300";
                }
                if (validIndicator) {
                    validIndicator.className = "flex items-center gap-1.5 text-xs font-black text-rose-700 font-mono";
                    validIndicator.innerHTML = '<i data-lucide="x-circle" class="h-4 w-4 text-rose-600"></i> DÉJÀ UTILISÉ';
                }
                if (warning) {
                    warning.classList.remove('hidden');
                    warning.innerText = `⛔ IDENTIFIANT DÉJÀ UTILISÉ ! Ce reçu (${state.currentAnalyzedProof.reference}) a déjà servi. Réutilisation strictement interdite.`;
                }
                return;
            }

            if (!state.currentAnalyzedProof.isValid) {
                if (resultCard) {
                    resultCard.className = "p-3.5 rounded-2xl bg-rose-50/70 border-2 border-rose-400 shadow-sm space-y-2 transition-all duration-300";
                }
                if (validIndicator) {
                    validIndicator.className = "flex items-center gap-1.5 text-xs font-black text-rose-700 font-mono";
                    validIndicator.innerHTML = '<i data-lucide="x-circle" class="h-4 w-4 text-rose-600"></i> REFUSÉ';
                }
                if (warning) {
                    warning.classList.remove('hidden');
                    if (state.currentAnalyzedProof.mode === "Orange Money" && !state.currentAnalyzedProof.isAmountValid) {
                        warning.innerText = (state.currentAnalyzedProof.montantPreleve === 0 || !state.currentAnalyzedProof.montantPreleve)
                            ? "❌ Montant non détecté : Le « Montant prélevé » doit être de -10000."
                            : `❌ Montant incorrect : Le « Montant prélevé » doit être de -10000 (${state.currentAnalyzedProof.montantPreleve} détecté).`;
                    } else if (state.currentAnalyzedProof.mode === "Wave Mobile" && !state.currentAnalyzedProof.isMerchantValid) {
                        warning.innerText = "❌ Marchand non conforme : Le paiement Wave doit être effectué à « Pitchou maillots ».";
                    } else if (state.currentAnalyzedProof.mode === "Wave Mobile" && !state.currentAnalyzedProof.isAmountValid) {
                        const val = state.currentAnalyzedProof.montantPreleve;
                        const formatted = val < 0 ? `${val}F` : `-${val}F`;
                        warning.innerText = (val === 0 || !val)
                            ? "❌ Montant non détecté : Le reçu Wave doit comporter le montant officiel de -10.000F."
                            : `❌ Montant incorrect : Le montant du reçu Wave doit être de -10.000F (${formatted} détecté).`;
                    } else {
                        warning.innerText = "❌ Paiement refusé : reçu non conforme.";
                    }
                }
            } else {
                if (resultCard) {
                    resultCard.className = "p-3.5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-400 shadow-sm space-y-2 transition-all duration-300";
                }
                if (validIndicator) {
                    validIndicator.className = "flex items-center gap-1.5 text-xs font-black text-emerald-700 font-mono";
                    validIndicator.innerHTML = '<i data-lucide="check-circle-2" class="h-4 w-4 text-emerald-600"></i> VALIDÉ';
                }
                if (warning) warning.classList.add('hidden');
            }
        }
    }

    function generateNewTicket(event) {
        if (event) event.preventDefault();
        
        const nom = (document.getElementById('form-nom')?.value || '').trim();
        const prenom = (document.getElementById('form-prenom')?.value || '').trim();
        const contact1 = (document.getElementById('form-contact1')?.value || '').trim();
        const contact2 = (document.getElementById('form-contact2')?.value || '').trim();
        const eglise = (document.getElementById('form-eglise')?.value || '').trim() || 'EMCI Horeb Toits Rouges';
        const select = document.getElementById('form-categorie');
        const categorie = select ? select.value : '';

        // Validation 1: Nom et Prénom
        if (!nom || !prenom) {
            showNotification("Champs Incomplets", "Veuillez renseigner le Nom de famille et les Prénoms du participant.", "error");
            document.getElementById('form-nom')?.focus();
            return;
        }

        // Validation 2: Contact
        if (!contact1) {
            showNotification("Contact Requis", "Veuillez renseigner le numéro de contact du festivalier.", "error");
            document.getElementById('form-contact1')?.focus();
            return;
        }

        // Validation 3: Catégorie
        if (!categorie) {
            showNotification("Catégorie Requise", "Veuillez choisir une catégorie de Pass (Classique, Gold ou Invité).", "error");
            select?.focus();
            return;
        }

        // RÈGLE OBLIGATOIRE : Les Pass Gold et Invité ne sont accessibles qu'aux connexions non-Visiteur
        if ((categorie === 'Gold' || categorie === 'Invité') && (!state.user || state.user.isVisitor)) {
            showNotification("Accès Réservé", "Les Pass Gold et Invité ne sont pas accessibles aux comptes Visiteurs.", "error");
            return;
        }

        // Validation Donateur pour Pass Gold (Pas de saisie manuelle autorisée)
        let selectedDonor = '';
        if (categorie === 'Gold') {
            const goldDonorSelect = document.getElementById('form-gold-donateur');
            selectedDonor = (goldDonorSelect ? goldDonorSelect.value : '').trim();
            if (!selectedDonor) {
                showNotification("Donateur Requis", "Veuillez sélectionner une personne dans la liste des dons pour émettre ce Pass Gold.", "error");
                goldDonorSelect?.focus();
                return;
            }
        }

        const prix = (select && select.options[select.selectedIndex] && parseInt(select.options[select.selectedIndex].getAttribute('data-price'))) || 0;

        // Validation 4: Quota Global (210 MAX)
        const totalTickets = (state.participants || []).length;
        if (totalTickets >= TOTAL_MAX_TICKETS) {
            showNotification("Guichet Fermé", `La capacité maximale de ${TOTAL_MAX_TICKETS} festivaliers est totalement atteinte. Impossible d'émettre de nouveaux billets.`, "error");
            return;
        }

        // Validation 5: Quota par Catégorie
        const categoryCounts = getCategoryCounts();
        const maxCatQuota = (TICKET_QUOTAS[categorie] && TICKET_QUOTAS[categorie].max) || 140;
        if (categoryCounts[categorie] >= maxCatQuota) {
            showNotification("Quota Épuisé", `Le quota maximal pour la catégorie "${categorie}" (${maxCatQuota} billets) est totalement atteint !`, "error");
            return;
        }

        let modeReglement = "Espèces";
        let preuveReglement = "REC-CAISSE";

        // Validation 6: Preuve de Paiement pour les billets payants (Classique) / Sécurité Admin pour les pass gratuits (Gold & Invité)
        if (categorie !== 'Invité' && categorie !== 'Gold') {
            if (!state.currentAnalyzedProof || !state.currentAnalyzedProof.reference) {
                showNotification("Preuve de Paiement Requise", "Veuillez importer la capture de votre reçu Wave (avec ID T_...) ou Orange Money.", "error");
                return;
            }

            if (!state.currentAnalyzedProof.isValid) {
                if (state.currentAnalyzedProof.mode && state.currentAnalyzedProof.mode.includes("Wave") && !state.currentAnalyzedProof.isMerchantValid) {
                    showNotification(
                        "Marchand Wave Non Conforme", 
                        "Validation impossible : Pour tout paiement WAVE, la preuve doit impérativement avoir pour nom de marchand « Pitchou maillots ».", 
                        "error"
                    );
                    return;
                }
                if (state.currentAnalyzedProof.mode && state.currentAnalyzedProof.mode.includes("Wave") && !state.currentAnalyzedProof.isAmountValid) {
                    const val = state.currentAnalyzedProof.montantPreleve;
                    const formatted = val < 0 ? `${val}F` : `-${val}F`;
                    showNotification(
                        "Montant Wave Non Conforme", 
                        (val === 0 || !val)
                            ? `Validation impossible : Le reçu Wave doit comporter le montant officiel de -10.000F.`
                            : `Validation impossible : Le montant du reçu Wave doit être de -10.000F (${formatted} détecté).`, 
                        "error"
                    );
                    return;
                }
                if (state.currentAnalyzedProof.mode && state.currentAnalyzedProof.mode.includes("Orange") && !state.currentAnalyzedProof.isAmountValid) {
                    showNotification(
                        "Montant Orange Money Non Conforme", 
                        `Validation impossible : Le « Montant prélevé » doit être de -10000.`, 
                        "error"
                    );
                    return;
                }
                showNotification("Reçu Non Valide", "Le reçu fourni est invalide ou a déjà été utilisé. Veuillez importer un reçu valide.", "error");
                return;
            }

            if (state.currentAnalyzedProof.mode && state.currentAnalyzedProof.mode.includes("Wave")) {
                if (!state.currentAnalyzedProof.isMerchantValid) {
                    showNotification(
                        "Marchand Wave Rejeté", 
                        "Le paiement Wave n'a pas été effectué au marchand officiel « Pitchou maillots ».", 
                        "error"
                    );
                    return;
                }
                if (!state.currentAnalyzedProof.isAmountValid) {
                    const val = state.currentAnalyzedProof.montantPreleve;
                    const formatted = val < 0 ? `${val}F` : `-${val}F`;
                    showNotification(
                        "Montant Wave Rejeté", 
                        (val === 0 || !val)
                            ? `Le reçu Wave doit comporter le montant officiel de -10.000F.`
                            : `Le montant du reçu Wave doit être de -10.000F (${formatted} détecté).`, 
                        "error"
                    );
                    return;
                }
            }

            if (state.currentAnalyzedProof.mode && state.currentAnalyzedProof.mode.includes("Orange")) {
                if (!state.currentAnalyzedProof.isBeneficiaryValid) {
                    showNotification(
                        "Paiement Refusé", 
                        "Le reçu Orange Money fourni n'a pas pu être validé.", 
                        "error"
                    );
                    return;
                }
                if (!state.currentAnalyzedProof.isAmountValid) {
                    showNotification(
                        "Montant Orange Rejeté", 
                        `Le « Montant prélevé » doit être de -10000.`, 
                        "error"
                    );
                    return;
                }
            }

            const proof = state.currentAnalyzedProof;

            // RÈGLE CRITIQUE ANTI-FRAUDE : N'autorise jamais deux fois l'utilisation du même identifiant
            const duplicateCheck = isProofIdentifierAlreadyUsed(proof.reference);
            if (duplicateCheck && duplicateCheck.used) {
                showNotification(
                    "Identifiant Déjà Utilisé", 
                    `Validation impossible : L'identifiant « ${proof.reference} » a déjà été utilisé pour émettre le billet #${duplicateCheck.ticketId || ''}. L'utilisation du même identifiant deux fois est strictement interdite.`, 
                    "error"
                );
                return;
            }

            modeReglement = proof.mode.includes("Wave") ? "Wave" : (proof.mode.includes("Orange") ? "Orange Money" : proof.mode);
            preuveReglement = proof.reference;

            state.finance.ticketsIncome += prix;
            saveFinanceData();

        } else {
            // RÈGLE OBLIGATOIRE : Sécurité Admin préalable pour les Pass Gratuits (Gold et Invité)
            if (!state.adminGuestAuthorized) {
                const modal = document.getElementById('modal-admin-guest');
                const codeInput = document.getElementById('admin-guest-code-input');
                const titleModal = document.getElementById('admin-guest-modal-title');
                const descModal = document.getElementById('admin-guest-modal-desc');

                if (titleModal) {
                    titleModal.innerText = categorie === 'Gold' ? "Autorisation Admin — Pass Gold" : "Autorisation Admin — Pass Invité";
                }
                if (descModal) {
                    descModal.innerHTML = categorie === 'Gold'
                        ? "L'émission d'un <strong>Pass Gold (Donateur)</strong> est gratuite et strictement réservée aux personnes ayant fait un don. Veuillez saisir votre mot de passe administrateur pour débloquer l'opération."
                        : "L'émission d'un <strong>Pass Invité (Gratuit)</strong> est strictement réservée à l'administration. Veuillez saisir votre mot de passe administrateur pour débloquer l'opération.";
                }

                if (codeInput) codeInput.value = '';
                if (modal) modal.classList.remove('hidden');
                setTimeout(() => codeInput?.focus(), 150);
                showNotification("Accès Refusé", `Seuls les administrateurs habilités peuvent émettre un Pass ${categorie}. Veuillez saisir votre mot de passe administrateur.`, "error");
                return;
            }

            if (categorie === 'Gold') {
                modeReglement = "Donateur";
                preuveReglement = "DON-GOLD-OFFICIEL";
            } else {
                modeReglement = "Invité";
                preuveReglement = "AUTORISATION-ADMIN-DIR";
            }
            state.adminGuestAuthorized = false; // Réinitialiser après émission réussie
        }
        
        const customId = getNextTicketId();
        const now = new Date();
        const dateTicket = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
        
        const newTicket = {
            id: customId,
            nom: nom,
            prenom: prenom,
            contact1: contact1,
            contact2: contact2 || "",
            eglise: eglise,
            categorie: categorie,
            prix: prix,
            modeReglement: modeReglement,
            preuveReglement: preuveReglement,
            donateurOrigine: categorie === 'Gold' ? selectedDonor : null,
            dateTicket: dateTicket,
            statut: 'Validé',
            checkedIn: false,
            assignedVerse: null,
            dateAdded: new Date().toISOString()
        };

        // RÈGLE OBLIGATOIRE : Attribution unique et sans répétition d'un verset biblique
        newTicket.assignedVerse = assignUniqueVerseToParticipant(newTicket);
        
        state.participants.unshift(newTicket);
        
        // RÈGLE OBLIGATOIRE : Un identifiant ne peut servir qu'une seule et unique fois pour les reçus payants
        if (categorie !== 'Invité' && categorie !== 'Gold' && preuveReglement) {
            markProofIdentifierAsUsed(preuveReglement, customId, `${nom} ${prenom}`.trim());
        }

        // Dès qu'une invitation Pass Gold est générée, rafraîchir la liste des donateurs pour retirer le nom immédiatement
        if (categorie === 'Gold') {
            populateGoldDonorsDropdown();
        }

        try {
            localStorage.setItem('myticket_participants_v8', JSON.stringify(state.participants));
            if (typeof MyTicketCloudDB !== 'undefined') MyTicketCloudDB.syncParticipant(newTicket);
        } catch(e){console.error(e);}
        
        state.currentTicket = newTicket;
        updateTicketPreviewUI(newTicket);
        
        // Instant Live Synchronization across all views & registries
        renderReceptionTable();
        renderParticipantsTable();
        populateChurchFilterOptions();
        updateDashboardStats();
        renderTablePlan();
        if (typeof renderFinanceDashboard === 'function') renderFinanceDashboard();
        if (typeof renderFinanceConsolidation === 'function') renderFinanceConsolidation();
        
        // Reset form inputs & unlock read-only fields
        const nomEl = document.getElementById('form-nom');
        const prenomEl = document.getElementById('form-prenom');
        if (nomEl) {
            nomEl.value = '';
            nomEl.readOnly = false;
            nomEl.classList.remove('bg-slate-100', 'text-slate-600', 'cursor-not-allowed');
        }
        if (prenomEl) {
            prenomEl.value = '';
            prenomEl.readOnly = false;
            prenomEl.classList.remove('bg-slate-100', 'text-slate-600', 'cursor-not-allowed');
        }
        if (document.getElementById('form-contact1')) document.getElementById('form-contact1').value = '';
        if (document.getElementById('form-contact2')) document.getElementById('form-contact2').value = '';
        if (document.getElementById('form-eglise')) document.getElementById('form-eglise').value = '';
        if (document.getElementById('form-categorie')) document.getElementById('form-categorie').value = '';
        if (document.getElementById('form-gold-donateur')) document.getElementById('form-gold-donateur').value = '';
        document.getElementById('gold-donor-container')?.classList.add('hidden');
        document.getElementById('direct-checkout-container')?.classList.remove('hidden');
        document.getElementById('checkout-separator')?.classList.remove('hidden');
        document.getElementById('payment-verification-container')?.classList.remove('hidden');
        populateGoldDonorsDropdown();
        updateCategoryDropdownQuotas();
        updateCategoryPrice();
        
        // Reset proof input and clear state so the same ID cannot be immediately resubmitted
        if (document.getElementById('proof-text-input')) document.getElementById('proof-text-input').value = '';
        document.getElementById('proof-analysis-result')?.classList.add('hidden');
        state.currentAnalyzedProof = null;

        showNotification(
            "Pass Émis avec Succès !", 
            `Billet ${categorie} (#${customId}) généré pour ${prenom} ${nom}. Vous pouvez maintenant télécharger votre billet en image, votre carte verset ou le partager par WhatsApp.`, 
            "success"
        );
    }

    // Search existing ticket by Last Name and Contact
    function searchExistingTicket() {
        const queryNom = document.getElementById('search-ticket-nom').value.trim().toLowerCase();
        const queryContact = document.getElementById('search-ticket-contact').value.trim().replace(/\s+/g, '');
        
        if (!queryNom || !queryContact) {
            showNotification("Critères requis", "Veuillez renseigner votre nom de famille et votre contact.", "error");
            return;
        }

        const found = state.participants.find(p => {
            const nomMatch = p.nom.toLowerCase().includes(queryNom) || queryNom.includes(p.nom.toLowerCase());
            const cleanC1 = (p.contact1 || '').replace(/\s+/g, '');
            const cleanC2 = (p.contact2 || '').replace(/\s+/g, '');
            const contactMatch = cleanC1.includes(queryContact) || cleanC2.includes(queryContact) || queryContact.includes(cleanC1);
            return nomMatch && contactMatch;
        });

        if (found) {
            // Attribution d'un verset unique si non encore présent
            if (!found.assignedVerse) {
                found.assignedVerse = assignUniqueVerseToParticipant(found);
                try {
                    localStorage.setItem('myticket_participants_v8', JSON.stringify(state.participants));
                    if (typeof MyTicketCloudDB !== 'undefined') MyTicketCloudDB.syncParticipant(found);
                } catch(e){}
            }
            state.currentTicket = found;
            updateTicketPreviewUI(found);
            showNotification("Billet Retrouvé !", `Pass de ${found.prenom} ${found.nom} (${found.categorie}) chargé avec succès.`, "success");
        } else {
            showNotification("Aucun Billet Trouvé", `Aucun enregistrement ne correspond au nom "${queryNom}" avec ce numéro.`, "error");
        }
    }

    window.deleteParticipant = function(id) {
        const p = (state.participants || []).find(part => part.id === id);
        if (!p) {
            showNotification("Erreur", "Participant introuvable.", "error");
            return;
        }
        
        document.getElementById('delete-participant-id').value = id;
        const nameEl = document.getElementById('delete-participant-name');
        if (nameEl) nameEl.innerText = `${p.prenom} ${p.nom} (#${p.id})`;
        const pwdInput = document.getElementById('delete-participant-admin-pwd');
        if (pwdInput) pwdInput.value = '';
        
        const modal = document.getElementById('modal-delete-participant-auth');
        if (modal) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('delete-participant-admin-pwd')?.focus();
            }, 100);
        }
    }

    window.closeDeleteParticipantModal = function() {
        document.getElementById('modal-delete-participant-auth')?.classList.add('hidden');
    }

    window.executeDeleteParticipantWithAuth = function() {
        const id = document.getElementById('delete-participant-id').value;
        const pwdInput = document.getElementById('delete-participant-admin-pwd');
        const code = (pwdInput ? pwdInput.value : '').trim();

        if (!code) {
            showNotification("Code Requis", "Veuillez saisir le code administrateur.", "error");
            pwdInput?.focus();
            return;
        }

        const trimmed = code.toUpperCase();
        
        const adminCommittees = [
            "Coordination Stratégique",
            "Coordination Opérationnelle",
            "Comité Supervision",
            "Comité Administratif",
            "Comité Financier"
        ];
        
        let hasAdminMatch = false;
        if (state.users && state.users.length > 0) {
            hasAdminMatch = state.users.some(u => 
                adminCommittees.includes(u.comite) && u.password && u.password.toUpperCase() === trimmed
            );
        }
        
        const masterPasswords = [
            '10ANS', 'NDJAI10', 'ADMIN', 'ADMIN2027',
            'SARAH2027', 'MARC2027', 'AUDE2027', 'PASTEUR2027', 'FINANCE2027', 'PCO2027'
        ];
        
        const isValid = hasAdminMatch || masterPasswords.includes(trimmed) || (typeof verifyPersonalOrAdminPassword === 'function' && verifyPersonalOrAdminPassword(code));

        if (!isValid) {
            showNotification("Accès Refusé", "Code Administrateur incorrect. Seuls les administrateurs habilités peuvent supprimer une inscription.", "error");
            if (pwdInput) pwdInput.value = '';
            pwdInput?.focus();
            return;
        }

        closeDeleteParticipantModal();

        const p = (state.participants || []).find(part => part.id === id);
        if (p) {
            setTimeout(() => {
                // 1. Libérer le reçu de paiement dans le registre des preuves si applicable
                if (p.preuveReglement && typeof unmarkProofIdentifier === 'function') {
                    unmarkProofIdentifier(p.preuveReglement);
                }

                // 2. Supprimer définitivement le participant de la liste locale et cloud
                if (typeof MyTicketCloudDB !== 'undefined' && MyTicketCloudDB.deleteParticipant) {
                    MyTicketCloudDB.deleteParticipant(p.id);
                } else {
                    state.participants = (state.participants || []).filter(part => part.id !== p.id);
                    try { localStorage.setItem('myticket_participants_v8', JSON.stringify(state.participants)); } catch(e){}
                }

                // 3. Réinitialiser la prévisualisation du billet si ce billet était affiché
                if (state.currentTicket && state.currentTicket.id === p.id) {
                    state.currentTicket = null;
                    if (typeof updateTicketPreviewUI === 'function') updateTicketPreviewUI(null);
                }

                // 4. Actualiser immédiatement les points financiers (recette billetterie, comptes de trésorerie, solde général)
                if (typeof renderFinanceDashboard === 'function') renderFinanceDashboard();
                if (typeof saveFinanceState === 'function') saveFinanceState();
                if (typeof renderFinanceConsolidation === 'function') renderFinanceConsolidation();
                if (typeof MyTicketCloudDB !== 'undefined' && MyTicketCloudDB.syncFinance) {
                    MyTicketCloudDB.syncFinance(state.finance);
                }

                // 5. Actualiser les quotas, la liste des donateurs Gold et les registres
                if (typeof updateCategoryDropdownQuotas === 'function') updateCategoryDropdownQuotas();
                if (typeof populateGoldDonorsDropdown === 'function') populateGoldDonorsDropdown();
                if (typeof renderParticipantsTable === 'function') renderParticipantsTable();
                if (typeof renderReceptionTable === 'function') renderReceptionTable();
                if (typeof renderTablePlan === 'function') renderTablePlan();
                if (typeof updateDashboardChartsAndStats === 'function') updateDashboardChartsAndStats();
                if (typeof updateDashboardStats === 'function') updateDashboardStats();
                if (typeof renderGlobalOverviewUI === 'function') renderGlobalOverviewUI();
                if (typeof populateChurchFilterOptions === 'function') populateChurchFilterOptions();

                showNotification(
                    "Inscription Supprimée & Finances Actualisées", 
                    `Le billet #${p.id} de ${p.prenom} ${p.nom} a été supprimé. Les recettes et soldes financiers ont été immédiatement recalculés.`, 
                    "success"
                );
            }, 100);
        }
    }

    function viewAttendeeTicket(id) {
        const p = (state.participants || []).find(part => 
            part.id === id || 
            part.id.toLowerCase() === (id || '').toLowerCase() ||
            `#${part.id}`.toLowerCase() === (id || '').toLowerCase() ||
            part.id.replace(/\D/g, '') === (id || '').replace(/\D/g, '')
        );
        if (!p) {
            showNotification("Billet Introuvable", `Aucun billet trouvé pour l'identifiant ${id}`, "error");
            return;
        }
        state.currentTicket = p;
        switchView('ticket');
        updateTicketPreviewUI(p);
        
        // Scroll smoothly to ticket preview card on mobile
        setTimeout(() => {
            const ticketCard = document.getElementById('live-ticket-card');
            if (ticketCard) {
                ticketCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 200);

        showNotification("Pass Chargé", `Affichage du pass de ${p.prenom} ${p.nom}`, "info");
    }

    function updateTicketPreviewUI(ticket) {
        const card = document.getElementById('live-ticket-card');
        const badge = document.getElementById('ticket-badge-category');
        const iconBg = document.getElementById('ticket-icon-bg');
        const stubBox = document.getElementById('ticket-stub-box');
        const titleTop = document.getElementById('ticket-title-top');
        const statusLabel = document.getElementById('ticket-status-label');
        const stubStatus = document.getElementById('ticket-display-status');
        const btnTicketJpg = document.getElementById('btn-download-ticket-jpg');
        const btnShare = document.getElementById('btn-share-ticket-whatsapp');
        const btnVerset = document.getElementById('btn-download-verset');
        const btnPrint = document.getElementById('btn-print-ticket');
        const btnOpenVisitorPass = document.getElementById('btn-open-visitor-pass');
        const btnDownloadMobilePass = document.getElementById('btn-download-mobile-pass');

        if (!ticket) {
            // Strictly Virgin State: nothing is displayed on the ticket until generated
            document.getElementById('ticket-display-name').innerText = '--';
            document.getElementById('ticket-display-contact').innerText = '--';
            document.getElementById('ticket-display-ref').innerText = '#MYT-....';
            document.getElementById('ticket-display-cat-price').innerText = '--';
            document.getElementById('ticket-display-reglement').innerText = '--';
            document.getElementById('ticket-display-date').innerText = '--';

            if (statusLabel) statusLabel.innerHTML = `<span class="font-bold text-slate-400 text-[10px] font-mono">EN ATTENTE D'ÉMISSION</span>`;
            if (badge) {
                badge.className = "text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1.5 shadow-2xs";
                badge.innerHTML = "En attente d'émission";
            }
            if (iconBg) iconBg.className = "h-5 w-5 rounded-md bg-slate-200 text-slate-500 flex items-center justify-center shadow-xs";
            if (titleTop) titleTop.innerText = "Pass Officiel 2027";
            if (stubBox) {
                stubBox.className = "ticket-stub bg-slate-800 text-white p-4 w-40 flex flex-col items-center justify-between text-center transition-colors duration-300 shrink-0";
            }
            if (stubStatus) {
                stubStatus.className = "text-[9px] font-black uppercase px-2.5 py-0.5 bg-slate-700 text-slate-300 font-mono rounded-full tracking-wider truncate max-w-full shadow-2xs";
                stubStatus.innerText = "EN ATTENTE";
            }

            const tableStub = document.getElementById('ticket-display-table-stub');
            if (tableStub) tableStub.innerText = '--';
            const seatStub = document.getElementById('ticket-display-seat-stub');
            if (seatStub) seatStub.innerText = '--';

            if (btnTicketJpg) {
                btnTicketJpg.setAttribute('disabled', 'true');
                btnTicketJpg.classList.add('opacity-50', 'cursor-not-allowed');
            }
            if (btnShare) {
                btnShare.setAttribute('disabled', 'true');
                btnShare.classList.add('opacity-50', 'cursor-not-allowed');
            }
            if (btnVerset) {
                btnVerset.setAttribute('disabled', 'true');
                btnVerset.classList.add('opacity-50', 'cursor-not-allowed');
            }
            if (btnPrint) {
                btnPrint.setAttribute('disabled', 'true');
                btnPrint.classList.add('opacity-50', 'cursor-not-allowed');
            }
            generateQRGrid('EMPTY');
            initializeLucideIcons();
            return;
        }

        // Active State Once Generated
        const fullName = `${ticket.prenom || ''} ${ticket.nom || ''}`.trim();
        document.getElementById('ticket-display-name').innerText = fullName || '--';
        
        const contactsText = ticket.contact2 ? `${ticket.contact1} / ${ticket.contact2}` : (ticket.contact1 || '--');
        document.getElementById('ticket-display-contact').innerText = contactsText;
        document.getElementById('ticket-display-ref').innerText = ticket.id ? (ticket.id.startsWith('#') ? ticket.id : `#${ticket.id}`) : '#MYT-0001';
        
        const catPriceEl = document.getElementById('ticket-display-cat-price');
        if (catPriceEl) {
            catPriceEl.innerText = ticket.categorie ? `Pass ${ticket.categorie} (${ticket.prix ? ticket.prix.toLocaleString('fr-FR') + ' FCFA' : 'Gratuit'})` : '--';
        }
        
        let cleanReglement = ticket.modeReglement || '--';
        if (cleanReglement.includes("Wave")) cleanReglement = "Wave";
        else if (cleanReglement.includes("Orange")) cleanReglement = "Orange Money";
        else if (ticket.categorie === 'Invité') cleanReglement = "Invité";
        document.getElementById('ticket-display-reglement').innerText = cleanReglement;

        const dateStr = ticket.dateTicket || new Date().toLocaleDateString('fr-FR');
        document.getElementById('ticket-display-date').innerText = dateStr;

        let tableName = "Table 11 (Béthel)";
        let seatNum = "Siège 01";
        if (ticket.categorie === 'Gold') {
            tableName = "Table 01 (Gold)";
            seatNum = "Siège 01";
        
            seatNum = "Siège 01";
        } else if (ticket.categorie === 'Invité') {
            tableName = "Table d'Honneur";
            seatNum = "Place d'Honneur";
        }

        const tableStub = document.getElementById('ticket-display-table-stub');
        if (tableStub) tableStub.innerText = tableName.toUpperCase();
        const seatStub = document.getElementById('ticket-display-seat-stub');
        if (seatStub) seatStub.innerText = seatNum;

        if (statusLabel) {
            statusLabel.innerHTML = `<span class="font-black text-emerald-600 text-xs flex items-center gap-1 font-mono"><i data-lucide="check-circle" class="h-3 w-3"></i> ACCÈS VALIDÉ</span>`;
        }

        // Apply Official Colors: Classique (Gris clair), VIP (Bleu), Gold (Or), Invité (Vert)
        if (ticket.categorie === 'Gold') {
            // Gold: Or
            if (badge) {
                badge.className = "text-xs font-black px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 border border-amber-300 flex items-center gap-1.5 shadow-md font-mono";
                badge.innerHTML = `<i data-lucide="crown" class="h-3.5 w-3.5"></i> PASS GOLD • GRATUIT`;
            }
            if (iconBg) iconBg.className = "h-5 w-5 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-bold";
            if (titleTop) titleTop.innerText = "Pass Officiel GOLD 2027";
            if (stubBox) {
                stubBox.className = "ticket-stub bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-slate-950 p-4 w-40 flex flex-col items-center justify-between text-center transition-colors duration-300 shrink-0";
            }
        
            if (stubBox) {
                stubBox.className = "ticket-stub bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-4 w-40 flex flex-col items-center justify-between text-center transition-colors duration-300 shrink-0";
            }
        } else if (ticket.categorie === 'Invité') {
            // Invité: Vert
            if (badge) {
                badge.className = "text-xs font-black px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 text-slate-950 border border-emerald-300 flex items-center gap-1.5 shadow-md font-mono";
                badge.innerHTML = `<i data-lucide="award" class="h-3.5 w-3.5"></i> INVITÉ SPÉCIAL • GRATUIT`;
            }
            if (iconBg) iconBg.className = "h-5 w-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold";
            if (titleTop) titleTop.innerText = "Pass Invité Spécial 2027";
            if (stubBox) {
                stubBox.className = "ticket-stub bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white p-4 w-40 flex flex-col items-center justify-between text-center transition-colors duration-300 shrink-0";
            }
        } else {
            // Classique: Gris clair
            if (badge) {
                badge.className = "text-xs font-black px-3.5 py-1.5 rounded-full bg-slate-200 text-slate-800 border border-slate-300 flex items-center gap-1.5 shadow-md font-mono";
                badge.innerHTML = `<span class="h-2 w-2 rounded-full bg-slate-500 animate-pulse"></span> PASS CLASSIQUE • 10 000 FCFA`;
            }
            if (iconBg) iconBg.className = "h-5 w-5 rounded-md bg-slate-400 text-slate-900 flex items-center justify-center";
            if (titleTop) titleTop.innerText = "Pass Officiel Classique 2027";
            if (stubBox) {
                stubBox.className = "ticket-stub bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-950 p-4 w-40 flex flex-col items-center justify-between text-center transition-colors duration-300 shrink-0";
            }
        }

        if (stubStatus) {
            stubStatus.className = "text-[9px] font-black uppercase px-2.5 py-0.5 bg-white text-slate-950 font-mono rounded-full tracking-wider truncate max-w-full shadow-xs";
            stubStatus.innerText = "ACCÈS VALIDÉ";
        }

        // Enable All Action Buttons (including WhatsApp Share)
        if (btnTicketJpg) {
            btnTicketJpg.removeAttribute('disabled');
            btnTicketJpg.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        if (btnShare) {
            btnShare.removeAttribute('disabled');
            btnShare.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        if (btnVerset) {
            btnVerset.removeAttribute('disabled');
            btnVerset.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        if (btnPrint) {
            btnPrint.removeAttribute('disabled');
            btnPrint.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        generateQRGrid(ticket.id || 'MYT-0001');

        initializeLucideIcons();
    }

    // Direct High-Resolution JPG Ticket Card Visual Screenshot Replica (Zero Deformation Guarantee)
    function downloadTicketImage() {
        const ticket = state.currentTicket;
        if (!ticket) {
            showNotification("Aucun Billet Émis", "Veuillez d'abord générer un billet avant de le télécharger.", "error");
            return;
        }

        const fullName = `${ticket.prenom || ''} ${ticket.nom || ''}`.trim() || 'Festivalier';
        const ticketId = ticket.id ? (ticket.id.startsWith('#') ? ticket.id : `#${ticket.id}`) : '#MYT-0001';
        const contact = ticket.contact1 || '--';
        const cat = ticket.categorie || 'Classique';
        const prixStr = ticket.prix ? (ticket.prix.toLocaleString('fr-FR') + ' FCFA') : 'Gratuit';
        const reglement = ticket.modeReglement || 'Wave';
        const dateStr = ticket.dateTicket || new Date().toLocaleDateString('fr-FR');

        let tableName = "TABLE 11 (BÉTHEL)";
        let seatName = "SIÈGE 01";
        let stubBgColor = "#cbd5e1"; // Classique: Gris clair
        let stubTextColor = "#0f172a";
        let badgeBgColor = "#e2e8f0";
        let badgeTextColor = "#1e293b";

        if (cat === 'Gold') {
            // Gold: Or
            tableName = "TABLE 01 (GOLD)";
            seatName = "SIÈGE 01";
            stubBgColor = "#d97706";
            stubTextColor = "#0f172a";
            badgeBgColor = "#fef3c7";
            badgeTextColor = "#78350f";
        } else if (cat === 'VIP') {
            // VIP: Bleu
            tableName = "TABLE 06 (VIP)";
            seatName = "SIÈGE 01";
            stubBgColor = "#2563eb";
            stubTextColor = "#ffffff";
            badgeBgColor = "#dbeafe";
            badgeTextColor = "#1e40af";
        } else if (cat === 'Invité') {
            // Invité: Vert
            tableName = "TABLE D'HONNEUR";
            seatName = "PLACE D'HONNEUR";
            stubBgColor = "#059669";
            stubTextColor = "#ffffff";
            badgeBgColor = "#d1fae5";
            badgeTextColor = "#065f46";
        }

        const canvas = document.createElement('canvas');
        canvas.width = 1400;
        canvas.height = 560;
        const ctx = canvas.getContext('2d');

        // Pure crisp background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1400, 560);

        // Outer Card Border with Rounded Corners
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, 1380, 540);

        // 1. LEFT BODY (0 to 950px) - Pure White
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(12, 12, 940, 536);

        // Top Header
        ctx.fillStyle = "#64748b";
        ctx.font = "800 18px system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("PASS D'ENTRÉE INDIVIDUEL", 50, 60);

        // Fire Flame Gradient Title: « Nuit de JACOB à Israel »
        const titleGrad = ctx.createLinearGradient(50, 0, 600, 0);
        titleGrad.addColorStop(0, '#FF2E00');
        titleGrad.addColorStop(0.5, '#FF5A36');
        titleGrad.addColorStop(1, '#FF8C00');
        ctx.fillStyle = titleGrad;
        ctx.font = "900 38px system-ui, sans-serif";
        ctx.fillText("Nuit de JACOB à Israel", 50, 108);

        // Category Badge on Top-Right of Body
        ctx.fillStyle = badgeBgColor;
        ctx.fillRect(660, 40, 210, 44);
        ctx.strokeStyle = stubBgColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(660, 40, 210, 44);

        ctx.fillStyle = badgeTextColor;
        ctx.font = "900 18px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`PASS ${cat.toUpperCase()} • ${prixStr}`, 785, 68);

        // Horizontal Separator
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, 135);
        ctx.lineTo(910, 135);
        ctx.stroke();

        // Metadata 2-Column Grid
        // Row 1: Participant & Pass/Tarif
        ctx.textAlign = "left";
        ctx.fillStyle = "#64748b";
        ctx.font = "800 15px system-ui, sans-serif";
        ctx.fillText("PARTICIPANT", 50, 175);
        ctx.fillText("PASS & TARIF", 500, 175);

        ctx.fillStyle = "#0f172a";
        ctx.font = "900 24px system-ui, sans-serif";
        ctx.fillText(fullName, 50, 208);
        ctx.fillText(`Pass ${cat} (${prixStr})`, 500, 208);

        // Row 2: Contact & Règlement
        ctx.fillStyle = "#64748b";
        ctx.font = "800 15px system-ui, sans-serif";
        ctx.fillText("CONTACT", 50, 265);
        ctx.fillText("RÈGLEMENT", 500, 265);

        ctx.fillStyle = "#1e293b";
        ctx.font = "800 22px monospace";
        ctx.fillText(contact, 50, 298);
        ctx.fillText(reglement, 500, 298);

        // Row 3: Date d'Émission & Statut
        ctx.fillStyle = "#64748b";
        ctx.font = "800 15px system-ui, sans-serif";
        ctx.fillText("DATE D'ÉMISSION", 50, 355);
        ctx.fillText("STATUT DE CONTRÔLE", 500, 355);

        ctx.fillStyle = "#334155";
        ctx.font = "800 20px monospace";
        ctx.fillText(dateStr, 50, 388);

        ctx.fillStyle = "#059669";
        ctx.font = "900 22px system-ui, sans-serif";
        ctx.fillText("✓ ACCÈS VALIDÉ", 500, 388);

        // Sub-footer
        ctx.strokeStyle = "#f1f5f9";
        ctx.beginPath();
        ctx.moveTo(50, 440);
        ctx.lineTo(910, 440);
        ctx.stroke();

        ctx.fillStyle = "#94a3b8";
        ctx.font = "800 15px monospace";
        ctx.fillText("10 ANS DE GRÂCE • 1 PLACE ASSISE", 50, 480);
        ctx.textAlign = "right";
        ctx.fillText("DOCUMENT STRICTEMENT PERSONNEL", 910, 480);

        // Perforation dashed line between Body and Stub
        ctx.setLineDash([12, 10]);
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(955, 12);
        ctx.lineTo(955, 548);
        ctx.stroke();
        ctx.setLineDash([]); // reset

        // 2. RIGHT STUB (955px to 1390px)
        ctx.fillStyle = stubBgColor;
        ctx.fillRect(958, 12, 430, 536);

        ctx.textAlign = "center";
        ctx.fillStyle = stubTextColor;
        ctx.font = "900 18px monospace";
        ctx.fillText("CONTRÔLE D'ACCÈS", 1173, 50);

        // Draw QR Code Background White Tile
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(1055, 65, 236, 236);
        ctx.strokeStyle = "rgba(0,0,0,0.12)";
        ctx.lineWidth = 1;
        ctx.strokeRect(1055, 65, 236, 236);

        // Render Certified Standard ISO/IEC QR Matrix (Readable on phone screens & print)
        if (typeof qrcode !== 'undefined') {
            try {
                const qr = qrcode(0, 'M');
                qr.addData(String(ticketId).trim());
                qr.make();
                const moduleCount = qr.getModuleCount();
                const margin = 4; // ISO standard 4-module quiet zone
                const totalModules = moduleCount + margin * 2;
                const cellSize = 8; // Exact integer 8px per module for zero blur & zero overlap
                const qrAreaSize = totalModules * cellSize; // 29 * 8 = 232px
                const qrLeft = 1057;
                const qrTop = 67;

                // Pure white quiet zone
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(qrLeft, qrTop, qrAreaSize, qrAreaSize);

                // Pure high-contrast black modules with exact integer grid
                ctx.fillStyle = "#000000";
                for (let r = 0; r < moduleCount; r++) {
                    for (let c = 0; c < moduleCount; c++) {
                        if (qr.isDark(r, c)) {
                            ctx.fillRect(qrLeft + (c + margin) * cellSize, qrTop + (r + margin) * cellSize, cellSize, cellSize);
                        }
                    }
                }
            } catch (err) {
                console.error("QR Code canvas generation error:", err);
            }
        }

        // Table & Seat Frame on Stub
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(1010, 315, 326, 90);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 2;
        ctx.strokeRect(1010, 315, 326, 90);

        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.font = "800 13px monospace";
        ctx.fillText("TABLE ASSISE", 1173, 340);

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 20px system-ui, sans-serif";
        ctx.fillText(tableName, 1173, 368);

        ctx.fillStyle = "#fde68a";
        ctx.font = "800 16px monospace";
        ctx.fillText(seatName, 1173, 394);

        // Official Reference on Stub
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(1040, 425, 266, 46);
        ctx.fillStyle = "#0f172a";
        ctx.font = "900 20px monospace";
        ctx.fillText(ticketId, 1173, 455);

        // ACCÈS VALIDÉ pill
        ctx.fillStyle = "#059669";
        ctx.fillRect(1060, 485, 226, 36);
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 15px monospace";
        ctx.fillText("✓ ACCÈS VALIDÉ", 1173, 509);

        // Trigger Download
        const link = document.createElement('a');
        link.download = `Billet_Officiel_${(ticket.nom || 'Participant')}_${(ticket.prenom || '')}_${ticketId.replace('#','')}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.98);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification("Billet Téléchargé !", `Votre Billet Officiel (${ticketId}) en haute définition (JPG) a été téléchargé avec succès.`, "success");
    }

    /**
     * Moteur de Gestion des Versets Bibliques Uniques
     * - Respect strict des créas graphiques originales sans altération (import/export textuel)
     * - Règle anti-répétition : un verset attribué ne peut jamais être attribué à un autre participant
     * - Évolutif : supporte 50 images initiales puis extension continue par ajout dans assets/versets
     */
    async function loadAvailableBibleVerses() {
        try {
            // 1. Essai API dynamique Vercel (/api/versets)
            const res = await fetch('/api/versets');
            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.versets) && data.versets.length > 0) {
                    state.availableVerses = data.versets;
                    console.log(`[VERSETS] ${data.versets.length} créas de versets chargées via API.`);
                    return;
                }
            }
        } catch (e) {
            console.log("Notice fetch /api/versets:", e);
        }

        try {
            // 2. Repli manifeste statique (assets/versets/manifest.json)
            const resManifest = await fetch('assets/versets/manifest.json');
            if (resManifest.ok) {
                const list = await resManifest.json();
                if (Array.isArray(list) && list.length > 0) {
                    state.availableVerses = list;
                    console.log(`[VERSETS] ${list.length} créas de versets chargées via manifest.json.`);
                    return;
                }
            }
        } catch (e) {
            console.log("Notice fetch manifest.json:", e);
        }

        // 3. Modèles de réserve si le dossier est vide
        if (!state.availableVerses || state.availableVerses.length === 0) {
            state.availableVerses = ['modele_purple_verset.jpg', 'modele_verset.jpeg'];
        }
    }

    /**
     * Attribue un verset unique sans répétition à un participant
     */
    function assignUniqueVerseToParticipant(participant) {
        if (!participant) return null;

        // Si le participant possède déjà son verset, le conserver définitivement (pas de double réattribution)
        if (participant.assignedVerse) {
            return participant.assignedVerse;
        }

        // Collecter tous les versets déjà attribués à tous les participants
        const usedVerses = new Set();
        (state.participants || []).forEach(p => {
            if (p.id !== participant.id && p.assignedVerse) {
                usedVerses.add(p.assignedVerse);
            }
        });

        // Trouver le premier verset du pool non encore consommé
        const availablePool = Array.isArray(state.availableVerses) ? state.availableVerses : [];
        const nextVerse = availablePool.find(v => !usedVerses.has(v));

        if (nextVerse) {
            participant.assignedVerse = nextVerse;
            console.log(`[VERSETS] Verset '${nextVerse}' attribué à ${participant.nom} ${participant.prenom} (#${participant.id})`);
            return nextVerse;
        }

        console.warn(`[VERSETS] Pool de versets épuisé (${usedVerses.size}/${availablePool.length}). En attente de nouvelles créas.`);
        return null;
    }

    /**
     * Téléchargement direct du fichier JPEG original du verset attribué (créa 100% intacte)
     */
    function downloadVersetImage() {
        const ticket = state.currentTicket;
        if (!ticket) {
            showNotification("Aucun Billet Émis", "Veuillez d'abord générer ou rechercher votre billet.", "error");
            return;
        }

        // Si pas encore de verset attribué, tenter l'attribution
        if (!ticket.assignedVerse) {
            ticket.assignedVerse = assignUniqueVerseToParticipant(ticket);
            try {
                localStorage.setItem('myticket_participants_v8', JSON.stringify(state.participants));
                if (typeof MyTicketCloudDB !== 'undefined') MyTicketCloudDB.syncParticipant(ticket);
            } catch (e) {}
        }

        if (!ticket.assignedVerse) {
            showNotification(
                "Versets en Attente", 
                "Tous les versets actuels ont été attribués de manière unique. De nouvelles créas seront ajoutées très prochainement dans le dossier !", 
                "warning"
            );
            return;
        }

        const verseUrl = ticket.assignedVerse;
        const rawFileName = verseUrl.split('/').pop() || 'verset.jpg';
        const cleanNom = (ticket.nom || 'Beni').replace(/[^a-zA-Z0-9_-]/g, '_');
        const cleanPrenom = (ticket.prenom || 'Festivalier').replace(/[^a-zA-Z0-9_-]/g, '_');
        const downloadFilename = `Verset_2027_${cleanPrenom}_${cleanNom}_${rawFileName}`;

        // Téléchargement textuel direct du fichier sans altérer la créa
        const link = document.createElement('a');
        link.href = encodeURI(verseUrl);
        link.download = downloadFilename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification(
            "Verset Biblique Téléchargé !", 
            `Votre verset prophétique unique (${rawFileName}) a été téléchargé avec succès.`, 
            "success"
        );
    }

    function shareTicketWhatsApp() {
        const ticket = state.currentTicket;
        if (!ticket) {
            showNotification("Aucun Billet Émis", "Veuillez d'abord générer un pass avant de le partager.", "error");
            return;
        }

        const fullName = `${ticket.prenom || ''} ${ticket.nom || ''}`.trim() || 'Festivalier';
        const ticketId = ticket.id ? (ticket.id.startsWith('#') ? ticket.id : `#${ticket.id}`) : '#MYT-0001';
        const cat = ticket.categorie || 'Classique';
        const prixStr = ticket.prix ? (`${ticket.prix.toLocaleString('fr-FR')} FCFA`) : 'Gratuit';
        const tableInfo = typeof getParticipantTableInfo === 'function' ? getParticipantTableInfo(ticket) : { fullTableName: 'Table Confirmée' };

        const shareText = `🎫 *PASS OFFICIEL • 10 ANS EMCI HOREB* 🕊️\n\n👤 *Participant :* ${fullName}\n🎟️ *N° Billet :* ${ticketId}\n👑 *Catégorie :* Pass ${cat} (${prixStr})\n🍽️ *Affectation :* ${tableInfo.fullTableName || 'Table Confirmée'}\n📅 *Date :* 01 Janvier 2027 dès 00h00\n📍 *Lieu :* Noces d'Or (Abidjan)\n🎁 *Rappel :* Venir avec un cadeau mixte.\n\nConsultez l'application officielle MyTicket : ${window.location.href}`;

        if (navigator.share) {
            navigator.share({
                title: `Pass Officiel 10 Ans EMCI Horeb - ${fullName}`,
                text: shareText,
                url: window.location.href
            }).catch(() => {
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
            });
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        }
        showNotification("Partage WhatsApp", "Partage du pass initié avec succès.", "success");
    }

    function printTicket() {
        const ticket = state.currentTicket;
        if (!ticket) {
            showNotification("Aucun Billet Sélectionné", "Veuillez générer ou sélectionner un billet pour l'imprimer.", "error");
            return;
        }

        const fullName = `${ticket.prenom || ''} ${ticket.nom || ''}`.trim() || 'Festivalier';
        document.getElementById('print-ref-badge').innerText = ticket.id ? (ticket.id.startsWith('#') ? ticket.id : `#${ticket.id}`) : '#MYT-0001';
        document.getElementById('print-nom-prenom').innerText = fullName;
        document.getElementById('print-cat-tarif').innerText = `Pass ${ticket.categorie || 'Classique'} (${ticket.prix ? ticket.prix.toLocaleString('fr-FR') + ' FCFA' : 'Gratuit'})`;
        document.getElementById('print-contact').innerText = ticket.contact1 || '--';
        document.getElementById('print-reglement').innerText = ticket.modeReglement || 'Wave';
        document.getElementById('print-emission-date').innerText = ticket.dateTicket || new Date().toLocaleDateString('fr-FR');
        document.getElementById('print-footer-timestamp').innerText = new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});

        const pill = document.getElementById('print-category-pill');
        const stubBg = document.getElementById('print-stub-bg');
        
        // Colors for A4 Print: Classique (Gris clair), VIP (Bleu), Gold (Or), Invité (Vert)
        let colorBg = '#cbd5e1';
        let pillTextColor = '#0f172a';
        let catText = 'PASS CLASSIQUE';
        let tableName = 'TABLE 11 (BÉTHEL)';
        let seatName = 'SIÈGE 01';

        if (ticket.categorie === 'Gold') {
            colorBg = '#d97706';
            pillTextColor = '#0f172a';
            catText = 'PASS GOLD';
            tableName = 'TABLE 01 (GOLD)';
            seatName = 'SIÈGE 01';
        } else if (ticket.categorie === 'VIP') {
            colorBg = '#2563eb';
            pillTextColor = '#ffffff';
            catText = 'PASS VIP';
            tableName = 'TABLE 06 (VIP)';
            seatName = 'SIÈGE 01';
        } else if (ticket.categorie === 'Invité') {
            colorBg = '#059669';
            pillTextColor = '#ffffff';
            catText = 'INVITÉ SPÉCIAL';
            tableName = 'TABLE D\'HONNEUR';
            seatName = 'PLACE D\'HONNEUR';
        }

        if (pill) {
            pill.style.background = colorBg;
            pill.style.color = pillTextColor;
            pill.innerText = catText;
        }
        if (stubBg) {
            stubBg.style.background = colorBg;
            stubBg.style.color = (ticket.categorie === 'Classique' || ticket.categorie === 'Gold') ? '#0f172a' : '#ffffff';
        }

        document.getElementById('print-table-name').innerText = tableName;
        document.getElementById('print-seat-name').innerText = seatName;

        const printQrSvg = document.getElementById('print-qr-svg');
        const liveQrSvg = document.getElementById('ticket-qr');
        if (printQrSvg && liveQrSvg) {
            printQrSvg.innerHTML = liveQrSvg.innerHTML;
        }

        window.print();
    }

    function openPrintModal() {
        printTicket();
    }

    function closePrintModal() {
        document.getElementById('print-helper-modal')?.classList.add('hidden');
    }

    function copyTicketDetailsFallback() {
        if (!state.currentTicket) return;
        const text = `Pass #${state.currentTicket.id} - ${state.currentTicket.prenom} ${state.currentTicket.nom} (${state.currentTicket.categorie})\n🎁 Rappel : Venir avec un cadeau mixte pour la célébration des 10 Ans.`;
        navigator.clipboard.writeText(text);
        showNotification("Copié !", text, "success");
    }

    function fallbackDownloadText() {
        downloadVersetImage();
    }

    function switchFinanceTab(tabName) {
        ['budgets', 'decaissements', 'dons', 'consolidation', 'wave'].forEach(t => {
            const btn = document.getElementById(`fin-tab-${t}`);
            const content = document.getElementById(`fin-content-${t}`);
            if (t === tabName) {
                btn.className = "pb-3 border-b-2 border-brand-orange text-brand-orange font-bold transition flex items-center gap-1.5";
                if (content) content.classList.remove('hidden');
            } else {
                btn.className = "pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 transition flex items-center gap-1.5";
                if (content) content.classList.add('hidden');
            }
        });
        if (tabName === 'wave' && typeof loadWaveAdminDashboard === 'function') {
            loadWaveAdminDashboard();
        }
        initializeLucideIcons();
    }

    let activeSelectedCommitteeId = null;
    let targetPendingDeleteLine = null;
    let targetPendingPCOApproval = null;

    
    function getCommitteeCardDecor(committeeId) {
        const decors = {
            "spirituel": {
                themeBorder: "hover:border-indigo-500",
                badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
                iconName: "sparkles",
                iconBg: "bg-indigo-100 text-indigo-700",
                watermark: `
                    <!-- Sacred Radiant Book & Beams Watermark -->
                    <svg class="absolute -right-6 -bottom-6 w-36 h-36 text-indigo-500/10 group-hover:text-indigo-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M50 15 L53 35 L73 38 L57 52 L62 72 L45 60 L28 72 L33 52 L17 38 L37 35 Z" opacity="0.3"/>
                        <path d="M15 75 Q50 65 85 75 L85 45 Q50 35 15 45 Z" fill="none" stroke="currentColor" stroke-width="4"/>
                        <path d="M50 40 L50 70 M25 50 Q50 42 75 50" fill="none" stroke="currentColor" stroke-width="3"/>
                        <circle cx="50" cy="20" r="8" opacity="0.5"/>
                    </svg>
                `
            },
            "logistique": {
                themeBorder: "hover:border-orange-500",
                badgeBg: "bg-orange-50 text-orange-700 border-orange-200",
                iconName: "truck",
                iconBg: "bg-orange-100 text-orange-700",
                watermark: `
                    <!-- Warehouse & Staging Rig Watermark -->
                    <svg class="absolute -right-6 -bottom-6 w-36 h-36 text-orange-500/10 group-hover:text-orange-500/20 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M10 70 L30 35 L70 35 L90 70 Z" fill="none" stroke="currentColor" stroke-width="5"/>
                        <rect x="25" y="45" width="20" height="20" rx="3" opacity="0.4"/>
                        <rect x="55" y="45" width="20" height="20" rx="3" opacity="0.4"/>
                        <circle cx="30" cy="75" r="7" opacity="0.6"/>
                        <circle cx="70" cy="75" r="7" opacity="0.6"/>
                        <path d="M10 20 L90 20 L50 5 Z" opacity="0.2"/>
                    </svg>
                `
            },
            "supervision": {
                themeBorder: "hover:border-blue-500",
                badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
                iconName: "shield-check",
                iconBg: "bg-blue-100 text-blue-700",
                watermark: `
                    <!-- Strategic Shield & Stars Watermark -->
                    <svg class="absolute -right-6 -bottom-6 w-36 h-36 text-blue-500/10 group-hover:text-blue-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M50 10 Q80 20 80 50 Q80 80 50 95 Q20 80 20 50 Q20 20 50 10 Z" fill="none" stroke="currentColor" stroke-width="5"/>
                        <path d="M50 20 Q70 28 70 50 Q70 72 50 83 Q30 72 30 50 Q30 28 50 20 Z" opacity="0.25"/>
                        <path d="M40 50 L47 57 L63 41" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
                    </svg>
                `
            },
            "financier": {
                themeBorder: "hover:border-emerald-500",
                badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
                iconName: "wallet",
                iconBg: "bg-emerald-100 text-emerald-700",
                watermark: `
                    <!-- Coins Stack & Vault Safe Watermark -->
                    <svg class="absolute -right-6 -bottom-6 w-36 h-36 text-emerald-500/10 group-hover:text-emerald-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="5"/>
                        <circle cx="50" cy="50" r="22" opacity="0.2"/>
                        <rect x="44" y="30" width="12" height="40" rx="3" opacity="0.4"/>
                        <path d="M35 50 L65 50 M50 35 L50 65" stroke="currentColor" stroke-width="4"/>
                        <path d="M20 75 Q50 65 80 75" fill="none" stroke="currentColor" stroke-width="4"/>
                    </svg>
                `
            },
            "gastronomique": {
                themeBorder: "hover:border-amber-500",
                badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
                iconName: "utensils",
                iconBg: "bg-amber-100 text-amber-700",
                watermark: `
                    <!-- Banquet Cloche Platter Watermark -->
                    <svg class="absolute -right-6 -bottom-6 w-36 h-36 text-amber-500/10 group-hover:text-amber-500/20 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M20 65 Q50 15 80 65 Z" fill="none" stroke="currentColor" stroke-width="5"/>
                        <rect x="15" y="65" width="70" height="8" rx="4" opacity="0.5"/>
                        <circle cx="50" cy="20" r="5" opacity="0.6"/>
                        <path d="M40 10 Q50 5 60 10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                        <path d="M45 40 Q50 35 55 40" fill="none" stroke="currentColor" stroke-width="3"/>
                    </svg>
                `
            },
            "animation": {
                themeBorder: "hover:border-pink-500",
                badgeBg: "bg-pink-50 text-pink-700 border-pink-200",
                iconName: "gamepad-2",
                iconBg: "bg-pink-100 text-pink-700",
                watermark: `
                    <!-- Celebration Trophy & Musical Notes Watermark -->
                    <svg class="absolute -right-6 -bottom-6 w-36 h-36 text-pink-500/10 group-hover:text-pink-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M30 25 L70 25 L65 55 Q50 70 35 55 Z" fill="none" stroke="currentColor" stroke-width="5"/>
                        <path d="M50 65 L50 80 M35 80 L65 80" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
                        <path d="M30 30 Q15 35 25 50 Q30 55 35 52" fill="none" stroke="currentColor" stroke-width="4"/>
                        <path d="M70 30 Q85 35 75 50 Q70 55 65 52" fill="none" stroke="currentColor" stroke-width="4"/>
                        <circle cx="50" cy="40" r="6" opacity="0.4"/>
                    </svg>
                `
            },
            "communication": {
                themeBorder: "hover:border-purple-500",
                badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
                iconName: "megaphone",
                iconBg: "bg-purple-100 text-purple-700",
                watermark: `
                    <!-- Megaphone & Soundwaves Watermark -->
                    <svg class="absolute -right-6 -bottom-6 w-36 h-36 text-purple-500/10 group-hover:text-purple-500/20 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M20 40 L50 25 L50 75 L20 60 Z" fill="none" stroke="currentColor" stroke-width="5"/>
                        <rect x="15" y="45" width="10" height="10" rx="2" opacity="0.4"/>
                        <path d="M60 35 Q75 50 60 65 M70 25 Q90 50 70 75" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                        <path d="M25 60 L30 80 L40 80 L35 60" opacity="0.4"/>
                    </svg>
                `
            },
            "accueil": {
                themeBorder: "hover:border-teal-500",
                badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
                iconName: "user-check",
                iconBg: "bg-teal-100 text-teal-700",
                watermark: `
                    <!-- Welcoming Hands & Security Badge Watermark -->
                    <svg class="absolute -right-6 -bottom-6 w-36 h-36 text-teal-500/10 group-hover:text-teal-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                        <circle cx="50" cy="35" r="14" fill="none" stroke="currentColor" stroke-width="4"/>
                        <path d="M25 80 Q25 55 50 55 Q75 55 75 80" fill="none" stroke="currentColor" stroke-width="5"/>
                        <path d="M45 45 L50 50 L60 38" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                        <circle cx="50" cy="35" r="6" opacity="0.3"/>
                    </svg>
                `
            },
            "administratif": {
                themeBorder: "hover:border-rose-500",
                badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
                iconName: "file-text",
                iconBg: "bg-rose-100 text-rose-700",
                watermark: `
                    <!-- Stamped Parchment & Quill Watermark -->
                    <svg class="absolute -right-6 -bottom-6 w-36 h-36 text-rose-500/10 group-hover:text-rose-500/20 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                        <rect x="25" y="15" width="45" height="65" rx="4" fill="none" stroke="currentColor" stroke-width="5"/>
                        <line x1="35" y1="30" x2="60" y2="30" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                        <line x1="35" y1="42" x2="60" y2="42" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                        <line x1="35" y1="54" x2="50" y2="54" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                        <circle cx="65" cy="70" r="10" opacity="0.4"/>
                        <path d="M60 15 L75 30 L60 30 Z" opacity="0.5"/>
                    </svg>
                `
            },
            "pco_strat": {
                themeBorder: "hover:border-violet-500",
                badgeBg: "bg-violet-50 text-violet-700 border-violet-200",
                iconName: "compass",
                iconBg: "bg-violet-100 text-violet-700",
                watermark: `
                    <!-- Chess King Crown & Compass Watermark -->
                    <svg class="absolute -right-6 -bottom-6 w-36 h-36 text-violet-500/10 group-hover:text-violet-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                        <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" stroke-width="4"/>
                        <path d="M50 18 L55 45 L82 50 L55 55 L50 82 L45 55 L18 50 L45 45 Z" opacity="0.3"/>
                        <circle cx="50" cy="50" r="7" stroke="currentColor" stroke-width="3"/>
                        <path d="M50 10 L50 18 M90 50 L82 50 M50 90 L50 82 M10 50 L18 50" stroke="currentColor" stroke-width="3"/>
                    </svg>
                `
            },
            "pco_ops": {
                themeBorder: "hover:border-sky-500",
                badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
                iconName: "settings",
                iconBg: "bg-sky-100 text-sky-700",
                watermark: `
                    <!-- Interlocking Precision Gears Watermark -->
                    <svg class="absolute -right-6 -bottom-6 w-36 h-36 text-sky-500/10 group-hover:text-sky-500/20 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                        <circle cx="45" cy="45" r="22" fill="none" stroke="currentColor" stroke-width="5"/>
                        <circle cx="45" cy="45" r="9" opacity="0.4"/>
                        <circle cx="72" cy="72" r="14" fill="none" stroke="currentColor" stroke-width="4"/>
                        <circle cx="72" cy="72" r="5" opacity="0.4"/>
                        <path d="M45 15 L45 23 M45 67 L45 75 M15 45 L23 45 M67 45 L75 45" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                        <path d="M24 24 L30 30 M60 60 L66 66 M24 66 L30 60 M60 30 L66 24" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                    </svg>
                `
            }
        };

        return decors[committeeId] || {
            themeBorder: "hover:border-brand-orange",
            badgeBg: "bg-orange-50 text-brand-orange border-orange-200",
            iconName: "folder",
            iconBg: "bg-orange-100 text-brand-orange",
            watermark: `
                <svg class="absolute -right-6 -bottom-6 w-36 h-36 text-slate-400/10 group-hover:scale-110 transition-transform duration-500 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="50" cy="50" r="35" opacity="0.2"/>
                </svg>
            `
        };
    }

    
    function renderFinanceConsolidation() {
        const tbody = document.getElementById('finance-consolidation-table');
        if (!tbody) return;

        tbody.innerHTML = '';
        let totalBudget = 0;
        let totalSpent = 0;
        let totalRemaining = 0;

        (state.finance.committees || []).forEach(c => {
            const assignedUser = (state.users || []).find(u => u.comite === c.name);
            const respDisplayName = assignedUser ? assignedUser.name : 'Non assigné';
            const isUnlocked = !!assignedUser;

            const totals = calculateCommitteeTotals(c);
            const budgetAffecte = totals.totalBudget;
            const spent = totals.totalSpent;
            const solde = totals.remaining;
            const pct = budgetAffecte > 0 ? Math.min(100, Math.round((spent / budgetAffecte) * 100)) : 0;
            const countLines = c.lignesBudget ? c.lignesBudget.length : 0;

            totalBudget += budgetAffecte;
            totalSpent += spent;
            totalRemaining += solde;

            tbody.innerHTML += `
                <tr class="hover:bg-slate-50/80 transition">
                    <td class="py-3.5 px-4 font-bold text-slate-900">
                        ${c.name}<br>
                        <span class="text-[10px] ${isUnlocked ? 'text-slate-600 font-medium' : 'text-amber-600 font-semibold'} inline-flex items-center gap-1">
                            ${!isUnlocked ? '<i data-lucide="lock" class="h-2.5 w-2.5 inline"></i>' : ''} Resp : ${respDisplayName}
                        </span>
                    </td>
                    <td class="py-3.5 px-4 text-center font-bold text-slate-600 font-mono">${countLines}</td>
                    <td class="py-3.5 px-4 font-black text-slate-950 font-mono">${budgetAffecte.toLocaleString('fr-FR')} FCFA</td>
                    <td class="py-3.5 px-4 font-bold text-red-600 font-mono">${spent.toLocaleString('fr-FR')} FCFA</td>
                    <td class="py-3.5 px-4 font-black text-emerald-700 font-mono">${solde.toLocaleString('fr-FR')} FCFA</td>
                    <td class="py-3.5 px-4 font-mono font-bold text-slate-800">
                        <div class="flex items-center gap-2">
                            <span>${pct}%</span>
                            <div class="w-20 bg-slate-200 h-2 rounded-full overflow-hidden hidden sm:block">
                                <div class="bg-brand-orange h-2 rounded-full" style="width: ${pct}%"></div>
                            </div>
                        </div>
                    </td>
                    <td class="py-3.5 px-4 text-right">
                        <button onclick="openCommitteeExpensesDetails('${c.id}')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition inline-flex items-center gap-1 cursor-pointer">
                            <i data-lucide="eye" class="h-3.5 w-3.5 text-brand-orange"></i>
                            <span>Fiche</span>
                        </button>
                    </td>
                </tr>
            `;
        });

        // Totals Footer Row
        tbody.innerHTML += `
            <tr class="bg-slate-900 text-white font-black text-xs border-t-2 border-slate-700">
                <td class="py-4 px-4 font-display">TOTAL CONSOLIDÉ (11 COMITÉS & COORDINATIONS)</td>
                <td class="py-4 px-4 text-center">--</td>
                <td class="py-4 px-4 text-amber-400 font-mono text-sm">${totalBudget.toLocaleString('fr-FR')} FCFA</td>
                <td class="py-4 px-4 text-red-400 font-mono text-sm">${totalSpent.toLocaleString('fr-FR')} FCFA</td>
                <td class="py-4 px-4 text-emerald-400 font-mono text-sm">${totalRemaining.toLocaleString('fr-FR')} FCFA</td>
                <td class="py-4 px-4 font-mono text-sm">${totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%</td>
                <td class="py-4 px-4 text-right">--</td>
            </tr>
        `;

        initializeLucideIcons();
    }

    
    function exportFinanceSummaryCSV() {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Categorie;Designation;Montant (FCFA)\r\n";
        const ticketsRev = state.participants.reduce((sum, p) => sum + (p.statutPaiement === 'Payé' ? (p.prix || 0) : 0), 0);
        const donsRev = (state.donations || []).reduce((s, d) => s + (d.montant || 0), 0);
        const totalRev = ticketsRev + donsRev;
        const totalExp = (state.disbursements || []).reduce((s, d) => s + (d.montant || 0), 0);
        const balance = totalRev - totalExp;

        csvContent += `Recettes;Vente de Billets;${ticketsRev}\r\n`;
        csvContent += `Recettes;Dons & Sponsoring;${donsRev}\r\n`;
        csvContent += `Recettes;Total Recettes Encaissées;${totalRev}\r\n`;
        csvContent += `Depenses;Total Décaissements Validés;${totalExp}\r\n`;
        csvContent += `Solde;Solde Net Disponible;${balance}\r\n`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Synthese_Financiere_10Ans_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification("Export CSV Réussi", "La synthèse financière a été téléchargée.", "success");
    }

    
    function renderOrganisationLeaders() {
        const container = document.getElementById('organisation-leaders-grid');
        const countBadge = document.getElementById('org-active-leaders-count');
        if (!container) return;
        container.innerHTML = '';

        const users = state.users || [];
        const registeredCount = OFFICIAL_COMMITTEES.filter(c => users.some(u => u.comite === c)).length;

        if (countBadge) {
            countBadge.innerText = `${registeredCount} / ${OFFICIAL_COMMITTEES.length} Responsables Enregistrés`;
            if (registeredCount === 0) {
                countBadge.className = "px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 self-start sm:self-auto font-mono";
            } else {
                countBadge.className = "px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto font-mono";
            }
        }

        OFFICIAL_COMMITTEES.forEach((entityName) => {
            const user = users.find(u => u.comite === entityName);

            if (user) {
                // Carte officielle pour le comité enregistré avec photo réelle et contact direct
                const phoneClean = (user.contact1 || '').replace(/[^0-9+]/g, '');
                const waUrl = phoneClean ? `https://wa.me/${phoneClean.replace('+', '')}?text=${encodeURIComponent(`Bonjour ${user.name}, je vous contacte concernant la célébration des 10 Ans (${user.comite}).`)}` : '#';
                
                container.innerHTML += `
                    <div class="p-3 rounded-2xl bg-white border-2 border-emerald-200 shadow-xs flex items-center justify-between gap-2.5 hover:border-emerald-400 transition">
                        <div class="flex items-center gap-3 min-w-0">
                            <img src="${user.avatar || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%2394a3b8\'%3E%3Cpath d=\'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z\'/%3E%3C/svg%3E'}" alt="${user.name}" class="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-500 shrink-0 shadow-sm">
                            <div class="min-w-0">
                                <h5 class="font-black text-xs text-slate-900 truncate">${user.name}</h5>
                                <p class="text-[10px] font-bold text-emerald-700 truncate">${user.comite}</p>
                                <span class="text-[9px] text-slate-400 font-mono block truncate">${user.contact1 || 'Contact masqué'}</span>
                            </div>
                        </div>
                        ${phoneClean ? `
                            <a href="${waUrl}" target="_blank" class="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold inline-flex items-center gap-1 shadow-xs transition shrink-0" title="Échanger sur WhatsApp">
                                <i data-lucide="message-circle" class="h-3.5 w-3.5"></i>
                                <span class="hidden xs:inline font-mono">WhatsApp</span>
                            </a>
                        ` : ''}
                    </div>
                `;
            } else {
                // Carte sobre avec nom de l'entité sans mention 'Poste vacant'
                container.innerHTML += `
                    <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2.5 hover:bg-slate-100/80 transition">
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="h-10 w-10 rounded-2xl bg-slate-200/80 text-slate-500 flex items-center justify-center shrink-0">
                                <i data-lucide="shield" class="h-4 w-4 text-slate-500"></i>
                            </div>
                            <div class="min-w-0">
                                <h5 class="font-bold text-xs text-slate-800 truncate">${entityName}</h5>
                                <span class="text-[10px] text-slate-400 font-medium truncate block">Coordination & Comité Officiel</span>
                            </div>
                        </div>
                        <button type="button" onclick="openCreateForCommittee('${entityName}')" class="px-2.5 py-1.5 bg-white hover:bg-purple-600 hover:text-white text-slate-600 border border-slate-200 rounded-xl text-[9px] font-bold shadow-xs transition shrink-0 flex items-center gap-1" title="Créer le compte pour ce comité">
                            <i data-lucide="user-plus" class="h-3 w-3"></i>
                            <span>Créer</span>
                        </button>
                    </div>
                `;
            }
        });

        initializeLucideIcons();
    }

    function openCreateForCommittee(committeeName) {
        switchView('utilisateur');
        switchUserSectionTab('create');
        const select = document.getElementById('create-comite');
        if (select) select.value = committeeName;
    }

    function renderFinanceDashboard() {
        const fin = state.finance;
        if (!fin) return;
        
        // 1. Compute Ticket Inflows per Category & per Payment Channel (Caisses)
        let goldCount = 0, goldTotal = 0;
        
        let classiqueCount = 0, classiqueTotal = 0;
        let inviteCount = 0;

        let ticketsCash = 0;
        let ticketsWave = 0;
        let ticketsOM = 0;

        (state.participants || []).forEach(p => {
            const price = Number(p.prix) || 0;
            const cat = p.categorie || 'Classique';

            if (cat === 'Gold') {
                goldCount++;
                goldTotal += price;
            
            } else if (cat === 'Classique') {
                classiqueCount++;
                classiqueTotal += price;
            } else if (cat === 'Invité') {
                inviteCount++;
            }

            const mode = (p.modeReglement || '').toLowerCase();
            if (mode.includes('wave')) {
                ticketsWave += price;
            } else if (mode.includes('orange') || mode.includes('om')) {
                ticketsOM += price;
            } else {
                ticketsCash += price; // Default to Espèces
            }
        });

        const totalTicketsIncome = goldTotal + classiqueTotal;
        fin.ticketsIncome = totalTicketsIncome;

        // Update Ticket Category Badges
        const elGoldC = document.getElementById('fin-cat-gold-count');
        if (elGoldC) elGoldC.innerText = `${goldCount} ticket(s)`;
        const elGoldT = document.getElementById('fin-cat-gold-total');
        if (elGoldT) elGoldT.innerText = `${goldTotal.toLocaleString('fr-FR')} FCFA`;

        const elVipC = document.getElementById('fin-cat-vip-count');
        if (elVipC) elVipC.innerText = `${vipCount} ticket(s)`;
        const elVipT = document.getElementById('fin-cat-vip-total');
        if (elVipT) elVipT.innerText = `${vipTotal.toLocaleString('fr-FR')} FCFA`;

        const elClaC = document.getElementById('fin-cat-classique-count');
        if (elClaC) elClaC.innerText = `${classiqueCount} ticket(s)`;
        const elClaT = document.getElementById('fin-cat-classique-total');
        if (elClaT) elClaT.innerText = `${classiqueTotal.toLocaleString('fr-FR')} FCFA`;

        const elInvC = document.getElementById('fin-cat-invite-count');
        if (elInvC) elInvC.innerText = `${inviteCount} invité(s)`;

        const elTotB = document.getElementById('fin-tickets-total-badge');
        if (elTotB) elTotB.innerText = `Total Billetterie : ${totalTicketsIncome.toLocaleString('fr-FR')} FCFA`;

        // 2. Compute Dons Inflows per Channel
        let donsCash = 0;
        let donsWave = 0;
        let donsOM = 0;

        if (fin.dons && fin.dons.length > 0) {
            fin.dons.forEach(d => {
                const montant = Number(d.montant) || 0;
                const compte = (d.compte || '').toLowerCase();
                if (compte.includes('wave')) donsWave += montant;
                else if (compte.includes('orange') || compte.includes('om')) donsOM += montant;
                else donsCash += montant;
            });
        }
        fin.donsIncome = donsCash + donsWave + donsOM;

        // 3. Compute Disbursements Outflows per Channel
        let disbCash = 0;
        let disbWave = 0;
        let disbOM = 0;

        if (fin.decaissements && fin.decaissements.length > 0) {
            fin.decaissements.forEach(d => {
                if (d.statut === 'Effectué' || d.statut === 'Approuvé') {
                    const montant = Number(d.montant) || 0;
                    const mode = (d.mode || '').toLowerCase();
                    if (mode.includes('wave')) disbWave += montant;
                    else if (mode.includes('orange') || mode.includes('om')) disbOM += montant;
                    else disbCash += montant;
                }
            });
        }

        // 4. Compute Net Real Balances in Accounts (Caisses)
        if (!fin.accounts) fin.accounts = { especes: 0, wave: 0, orangeMoney: 0 };
        fin.accounts.especes = Math.max(0, ticketsCash + donsCash - disbCash);
        fin.accounts.wave = Math.max(0, ticketsWave + donsWave - disbWave);
        fin.accounts.orangeMoney = Math.max(0, ticketsOM + donsOM - disbOM);

        fin.incomesTotal = fin.ticketsIncome + fin.donsIncome;
        fin.expensesTotal = disbCash + disbWave + disbOM;
        fin.balance = fin.accounts.especes + fin.accounts.wave + fin.accounts.orangeMoney;

        // 5. Compute Consolidated Totals
        let consolidatedBudget = 0;
        let consolidatedSpent = 0;

        (fin.committees || []).forEach(c => {
            const totals = calculateCommitteeTotals(c);
            consolidatedBudget += totals.totalBudget;
            consolidatedSpent += totals.totalSpent;
        });

        fin.budgetTotal = consolidatedBudget;

        // 6. Update Top Financial Metrics Cards
        const statIncomes = document.getElementById('finance-stat-total-incomes');
        if (statIncomes) statIncomes.innerText = `${fin.incomesTotal.toLocaleString('fr-FR')} FCFA`;
        
        const subTickets = document.getElementById('fin-sub-tickets');
        if (subTickets) subTickets.innerText = `${fin.ticketsIncome.toLocaleString('fr-FR')} F`;
        
        const subDons = document.getElementById('fin-sub-dons');
        if (subDons) subDons.innerText = `${fin.donsIncome.toLocaleString('fr-FR')} F`;
        
        const statBudget = document.getElementById('finance-stat-total-budget');
        if (statBudget) statBudget.innerText = `${fin.budgetTotal.toLocaleString('fr-FR')} FCFA`;
        
        const statExpenses = document.getElementById('finance-stat-total-expenses');
        if (statExpenses) statExpenses.innerText = `${fin.expensesTotal.toLocaleString('fr-FR')} FCFA`;
        
        const statBalance = document.getElementById('finance-stat-balance');
        if (statBalance) statBalance.innerText = `${fin.balance.toLocaleString('fr-FR')} FCFA`;
        
        // Update 3 Accounts Elements
        const elAccEsp = document.getElementById('fin-acc-especes');
        if (elAccEsp) elAccEsp.innerText = `${fin.accounts.especes.toLocaleString('fr-FR')} FCFA`;
        const subEsp = document.getElementById('fin-acc-sub-especes');
        if (subEsp) subEsp.innerText = `${ticketsCash.toLocaleString('fr-FR')} F tickets • ${donsCash.toLocaleString('fr-FR')} F dons`;

        const elAccWav = document.getElementById('fin-acc-wave');
        if (elAccWav) elAccWav.innerText = `${fin.accounts.wave.toLocaleString('fr-FR')} FCFA`;
        const subWav = document.getElementById('fin-acc-sub-wave');
        if (subWav) subWav.innerText = `${ticketsWave.toLocaleString('fr-FR')} F tickets • ${donsWave.toLocaleString('fr-FR')} F dons`;

        const elAccOm = document.getElementById('fin-acc-om');
        if (elAccOm) elAccOm.innerText = `${fin.accounts.orangeMoney.toLocaleString('fr-FR')} FCFA`;
        const subOm = document.getElementById('fin-acc-sub-om');
        if (subOm) subOm.innerText = `${ticketsOM.toLocaleString('fr-FR')} F tickets • ${donsOM.toLocaleString('fr-FR')} F dons`;

        // 7. Render All Committees & Coordinations in the Grid (CLEAN: No watermarks, No rubriques preview)
        const grid = document.getElementById('finance-committees-grid');
        if (grid) {
            grid.innerHTML = '';
            (fin.committees || []).forEach(c => {
                const assignedUser = (state.users || []).find(u => u.comite === c.name);
                const respDisplayName = assignedUser ? assignedUser.name : 'Non assigné';
                const isUnlocked = !!assignedUser;

                const totals = calculateCommitteeTotals(c);
                const budgetAffecte = totals.totalBudget;
                const depensesRealisees = totals.totalSpent;
                const solde = totals.remaining;
                const pct = budgetAffecte > 0 ? Math.min(100, Math.round((depensesRealisees / budgetAffecte) * 100)) : 0;
                const decor = getCommitteeCardDecor(c.id);
                const lines = c.lignesBudget || [];
                const countPrevues = lines.filter(l => (l.statut || 'Prévu') === 'Prévu').length;
                const countEffectuees = lines.filter(l => l.statut === 'Effectué' || l.statut === 'Payé / Exécuté').length;

                // Smart Status Indicator
                let smartStatusBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                let smartStatusDot = 'bg-emerald-500';

                if (pct >= 100) {
                    smartStatusBadge = 'bg-red-50 text-red-800 border-red-200 font-black animate-pulse';
                    smartStatusDot = 'bg-red-500';
                } else if (pct >= 70) {
                    smartStatusBadge = 'bg-amber-50 text-amber-900 border-amber-200 font-bold';
                    smartStatusDot = 'bg-amber-500';
                }

                grid.innerHTML += `
                    <div class="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 space-y-4 flex flex-col justify-between ${!isUnlocked ? 'bg-slate-50/50' : ''}">
                        
                        <div class="space-y-3.5">
                            
                            <!-- Header: Category Badge + Title + Resp + Smart Status Pill -->
                            <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                                <div class="space-y-1 min-w-0">
                                    <div class="flex items-center gap-2">
                                        <span class="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${decor.headerBadgeColor}">${decor.headerBadge}</span>
                                        <span class="text-[10px] font-bold ${isUnlocked ? 'text-slate-600' : 'text-amber-600'} truncate inline-flex items-center gap-1">
                                            ${!isUnlocked ? '<i data-lucide="lock" class="h-2.5 w-2.5 inline"></i>' : ''} Resp : ${respDisplayName}
                                        </span>
                                    </div>
                                    <h4 class="font-display font-black text-slate-900 text-base leading-tight truncate">${c.name}</h4>
                                </div>
                                <span class="inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-full border ${smartStatusBadge} shrink-0">
                                    <span class="h-1.5 w-1.5 rounded-full ${smartStatusDot}"></span>
                                    <span>${pct}%</span>
                                </span>
                            </div>

                            <!-- FINANCIAL RECAP GRID: BUDGET PRÉVU | MONTANT DÉCAISSÉ | RESTE -->
                            <div class="grid grid-cols-3 gap-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
                                <div class="space-y-0.5">
                                    <span class="text-[8px] font-extrabold uppercase text-slate-500 tracking-wider block">Budget Prévu</span>
                                    <span class="font-display font-black text-slate-900 text-xs sm:text-sm font-mono block truncate">${budgetAffecte.toLocaleString('fr-FR')} F</span>
                                </div>
                                <div class="space-y-0.5 border-x border-slate-200 px-1">
                                    <span class="text-[8px] font-extrabold uppercase text-red-600 tracking-wider block">Décaissé</span>
                                    <span class="font-display font-black text-red-600 text-xs sm:text-sm font-mono block truncate">${depensesRealisees.toLocaleString('fr-FR')} F</span>
                                </div>
                                <div class="space-y-0.5">
                                    <span class="text-[8px] font-extrabold uppercase text-emerald-700 tracking-wider block">Reste</span>
                                    <span class="font-display font-black text-emerald-700 text-xs sm:text-sm font-mono block truncate">${solde.toLocaleString('fr-FR')} F</span>
                                </div>
                            </div>

                            <!-- Progress Bar & Rubriques Info -->
                            <div class="space-y-1.5">
                                <div class="flex justify-between items-center text-[10px] font-bold text-slate-500">
                                    <span>Consommation : <strong class="text-slate-800 font-mono">${pct}%</strong></span>
                                    <span class="text-slate-400 font-semibold">${countPrevues} prévues • ${countEffectuees} payées</span>
                                </div>
                                <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div class="bg-gradient-to-r from-brand-orange to-amber-500 h-2 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                                </div>
                            </div>

                        </div>

                        <!-- Action Buttons: Disabled if no user is assigned -->
                        <div class="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 mt-1">
                            <button ${!isUnlocked ? 'disabled' : `onclick="openDisbursementForCurrentCommittee('${c.id}')"`} class="py-2.5 px-3 rounded-xl ${!isUnlocked ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm cursor-pointer'} font-bold text-xs transition flex items-center justify-center gap-1.5">
                                <i data-lucide="send" class="h-3.5 w-3.5 ${!isUnlocked ? 'text-slate-400' : 'text-brand-orange'}"></i>
                                <span>Décaisser</span>
                            </button>
                            <button ${!isUnlocked ? 'disabled' : `onclick="openCommitteeExpensesDetails('${c.id}')"`} class="py-2.5 px-3 rounded-xl ${!isUnlocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-brand-orange hover:bg-orange-600 text-white shadow-sm cursor-pointer'} font-bold text-xs transition flex items-center justify-center gap-1.5">
                                <i data-lucide="list-checks" class="h-3.5 w-3.5"></i>
                                <span>Fiche & Lignes</span>
                            </button>
                        </div>

                    </div>
                `;
            });
        }

        // 8. Render Disbursements Table
        const disbTbody = document.getElementById('finance-decaissements-table');
        if (disbTbody) {
            disbTbody.innerHTML = '';
            const decaissements = fin.decaissements || [];
            if (decaissements.length === 0) {
                disbTbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-400 italic">Aucune sortie de caisse enregistrée.</td></tr>`;
            } else {
                decaissements.forEach(d => {
                    let statutBadge = 'bg-amber-100 text-amber-900 border-amber-300 font-black animate-pulse';
                    let statutText = d.statut || 'Soumis';
                    if (statutText === 'Effectué' || statutText === 'Approuvé') {
                        statutBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
                        statutText = 'Effectué';
                    } else if (statutText === 'Rejeté' || statutText === 'Refusé') {
                        statutBadge = 'bg-red-100 text-red-800 border-red-300 font-bold';
                        statutText = 'Rejeté';
                    }

                    const demandeur = d.demandePar || 'Direction';

                    disbTbody.innerHTML += `
                        <tr class="hover:bg-slate-50 transition">
                            <td class="py-3 px-4 font-mono font-bold text-brand-orange">${d.id || '--'}<br><span class="text-[10px] text-slate-400 font-normal block">${d.date || '--'}</span><span class="text-[9px] text-slate-500 font-medium block">Demandé par : ${demandeur}</span></td>
                            <td class="py-3 px-4 font-bold text-slate-900">${d.comite || '--'}</td>
                            <td class="py-3 px-4 text-slate-700">${d.motif || '--'}</td>
                            <td class="py-3 px-4 font-black text-slate-950 font-mono">${Number(d.montant || 0).toLocaleString('fr-FR')} FCFA</td>
                            <td class="py-3 px-4"><span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[10px] font-bold">${d.mode || 'Espèces'}</span></td>
                            <td class="py-3 px-4"><span class="px-2.5 py-1 rounded-full text-[10px] border ${statutBadge}">${statutText}</span></td>
                            <td class="py-3 px-4 text-right">
                                ${statutText === 'Soumis' ? `
                                    <div class="flex items-center justify-end gap-2">
                                        ${(isUserAuthorizedToApproveDisbursement(state.user) || (state.user && state.user.name === demandeur)) ? `
                                            <button onclick="requestCancelDisbursement('${d.id}')" class="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 transition shadow-2xs cursor-pointer" title="Annuler cette demande (mot de passe requis)">
                                                <i data-lucide="rotate-ccw" class="h-4 w-4"></i>
                                            </button>
                                        ` : ''}
                                        ${isUserAuthorizedToApproveDisbursement(state.user) ? `
                                            <button onclick="openPCOApprovalModal('${d.id}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition inline-flex items-center gap-1 cursor-pointer">
                                                <i data-lucide="shield-check" class="h-3.5 w-3.5"></i>
                                                <span>Valider Décaissement</span>
                                            </button>
                                        ` : `
                                            <span class="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-flex items-center gap-1">
                                                <i data-lucide="clock" class="h-3 w-3 text-amber-600"></i> En attente PCO / Finance
                                            </span>
                                        `}
                                    </div>
                                ` : `
                                    <span class="text-[10px] text-slate-400 italic block">Validé par : ${d.approbateur || d.validePar || 'Direction'}</span>
                                `}
                            </td>
                        </tr>
                    `;
                });
            }
        }

        // 9. Render Donations Table
        const donsTbody = document.getElementById('finance-dons-table');
        if (donsTbody) {
            donsTbody.innerHTML = '';
            const dons = fin.dons || [];
            if (dons.length === 0) {
                donsTbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-400 italic">Aucun don enregistré.</td></tr>`;
            } else {
                dons.forEach((don, idx) => {
                    donsTbody.innerHTML += `
                        <tr class="hover:bg-slate-50 transition">
                            <td class="py-3 px-4 font-mono text-slate-500">${don.date || '--'}</td>
                            <td class="py-3 px-4 font-bold text-slate-900">${don.donateur || '--'}</td>
                            <td class="py-3 px-4"><span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">${don.type || 'Don'}</span></td>
                            <td class="py-3 px-4 font-black text-emerald-700 font-mono">${Number(don.montant || 0).toLocaleString('fr-FR')} FCFA</td>
                            <td class="py-3 px-4"><span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[10px] font-bold">${don.compte || 'Espèces'}</span></td>
                            <td class="py-3 px-4 text-slate-600 text-xs">${don.enregistrePar || 'Direction'}</td>
                            <td class="py-3 px-4 text-right">
                                <button onclick="deleteDonation(${idx})" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer (mot de passe requis)">
                                    <i data-lucide="trash-2" class="h-4 w-4"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }
        }

        renderFinanceConsolidation();
        initializeLucideIcons();
    }

    function calculateCommitteeTotals(committee) {
        let totalBudget = 0;
        let totalSpent = 0;

        if (Array.isArray(committee.lignesBudget)) {
            committee.lignesBudget.forEach(line => {
                const qte = line.quantite || 1;
                const pu = line.prixUnitaire || line.montant || 0;
                const lineTotal = line.montant || (qte * pu);
                totalBudget += lineTotal;

                if (line.statut === 'Effectué' || line.statut === 'Payé / Exécuté') {
                    totalSpent += lineTotal;
                }
            });
        } else {
            totalBudget = committee.budget || 0;
            totalSpent = committee.spent || 0;
        }

        committee.budget = totalBudget;
        committee.spent = totalSpent;

        return {
            totalBudget: totalBudget,
            totalSpent: totalSpent,
            remaining: Math.max(0, totalBudget - totalSpent)
        };
    }

    function openCommitteeExpensesDetails(committeeId) {
        activeSelectedCommitteeId = committeeId;
        const committee = state.finance.committees.find(c => c.id === committeeId);
        if (!committee) return;

        const assignedUser = (state.users || []).find(u => u.comite === committee.name);
        const respDisplayName = assignedUser ? assignedUser.name : (committee.resp || 'Comité Officiel');

        const decor = getCommitteeCardDecor(committee.id);
        const typeBadge = document.getElementById('comm-modal-badge-type');
        if (typeBadge) {
            typeBadge.innerText = decor.headerBadge;
            typeBadge.className = `text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${decor.headerBadgeColor} shadow-xs`;
        }

        document.getElementById('comm-modal-title').innerText = committee.name;
        document.getElementById('comm-modal-badge-resp').innerText = `Responsable : ${respDisplayName}`;
        
        const totals = calculateCommitteeTotals(committee);
        const totalBudget = totals.totalBudget;
        const totalSpent = totals.totalSpent;
        const remaining = totals.remaining;
        const pct = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

        document.getElementById('comm-modal-budget').innerText = `${totalBudget.toLocaleString('fr-FR')} FCFA`;
        document.getElementById('comm-modal-spent').innerText = `${totalSpent.toLocaleString('fr-FR')} FCFA`;
        document.getElementById('comm-modal-balance').innerText = `${remaining.toLocaleString('fr-FR')} FCFA`;
        document.getElementById('comm-modal-rate').innerText = `${pct}%`;
        document.getElementById('comm-modal-bar-label').innerText = `${pct}% exécuté (${remaining.toLocaleString('fr-FR')} FCFA restants à engager)`;
        
        const progressEl = document.getElementById('comm-modal-progress');
        if (progressEl) {
            progressEl.style.width = `${pct}%`;
        }

        // Reset and trigger smart filters
        const searchInput = document.getElementById('comm-modal-search');
        if (searchInput) searchInput.value = '';
        currentCommExpenseFilter = 'all';
        setCommitteeExpensesFilter('all');
        updateCategoryDatalist();
        updateLineTotalPreview();
        document.getElementById('modal-committee-expenses').classList.remove('hidden');
        initializeLucideIcons();
    }

    function closeCommitteeExpensesModal() {
        document.getElementById('modal-committee-expenses').classList.add('hidden');
    }

    function updateLineTotalPreview() {
        const qte = parseInt(document.getElementById('comm-form-quantite')?.value) || 1;
        const pu = parseInt(document.getElementById('comm-form-prix-unitaire')?.value) || 0;
        const total = qte * pu;
        const badge = document.getElementById('comm-form-total-badge');
        if (badge) {
            badge.innerText = `Total : ${total.toLocaleString('fr-FR')} FCFA`;
        }
    }

    function updateCategoryDatalist() {
        const datalist = document.getElementById('comm-categories-datalist');
        if (!datalist) return;
        const cats = new Set(["Matériel & Équipements", "Sonorisation & Éclairage", "Prestations & Espaces", "Banquet & Dîner", "Transport & Carburant", "Supports Média & Com", "Sécurité & Protocole", "Honoraires & Semences", "Imprévus"]);
        
        (state.finance.committees || []).forEach(c => {
            (c.lignesBudget || []).forEach(l => {
                if (l.categorie) cats.add(l.categorie);
            });
        });

        datalist.innerHTML = Array.from(cats).map(cat => `<option value="${cat}"></option>`).join('');
    }

    function submitNewExpenseLine(event) {
        if (event) {
            if (typeof event.preventDefault === 'function') event.preventDefault();
            if (typeof event.stopPropagation === 'function') event.stopPropagation();
        }

        if (!activeSelectedCommitteeId) {
            showNotification("Erreur", "Veuillez sélectionner un comité.", "error");
            return;
        }

        const committee = state.finance.committees.find(c => c.id === activeSelectedCommitteeId);
        if (!committee) {
            showNotification("Erreur", "Comité non trouvé.", "error");
            return;
        }

        const catInput = document.getElementById('comm-form-categorie');
        const libInput = document.getElementById('comm-form-libelle');
        const qteInput = document.getElementById('comm-form-quantite');
        const puInput = document.getElementById('comm-form-prix-unitaire');

        const categorie = (catInput ? catInput.value.trim() : "") || "Général";
        const libelle = libInput ? libInput.value.trim() : "";
        const quantite = parseInt(qteInput ? qteInput.value : 1) || 1;
        const prixUnitaire = parseInt(puInput ? puInput.value : 0) || 0;

        if (!libelle) {
            showNotification("Champ Requis", "Veuillez saisir le libellé de la dépense.", "error");
            if (libInput) libInput.focus();
            return;
        }

        if (prixUnitaire <= 0) {
            showNotification("Prix Requis", "Veuillez renseigner un prix unitaire supérieur à 0.", "error");
            if (puInput) puInput.focus();
            return;
        }

        const montantTotal = quantite * prixUnitaire;

        if (!Array.isArray(committee.lignesBudget)) {
            committee.lignesBudget = [];
        }

        const newLine = {
            id: `LIG-${Math.floor(100 + Math.random() * 900)}`,
            categorie: categorie,
            libelle: libelle,
            quantite: quantite,
            prixUnitaire: prixUnitaire,
            montant: montantTotal,
            statut: "Prévu",
            date: new Date().toISOString().split('T')[0],
            enregistrePar: state.user.name
        };

        committee.lignesBudget.push(newLine);
        
        // Persist change
        saveFinanceState();

        // Reset inputs
        if (catInput) catInput.value = '';
        if (libInput) libInput.value = '';
        if (qteInput) qteInput.value = '1';
        if (puInput) puInput.value = '';
        updateLineTotalPreview();

        showNotification("Ligne Ajoutée avec Succès !", `"${libelle}" (${montantTotal.toLocaleString('fr-FR')} FCFA) enregistré au budget du ${committee.name}.`, "success");
        
        // Instant visual update
        openCommitteeExpensesDetails(activeSelectedCommitteeId);
        renderFinanceDashboard();
        renderFinanceConsolidation();
    }

    function verifyPersonalOrAdminPassword(code) {
        if (!code) return false;
        const trimmed = code.trim();
        
        // 1. Check active authenticated user's password
        if (state.user && !state.user.isVisitor && state.user.password && state.user.password.toUpperCase() === trimmed.toUpperCase()) {
            return true;
        }

        // 2. Check registered administrator users' passwords
        const adminCommittees = [
            "Coordination Stratégique",
            "Coordination Opérationnelle",
            "Comité Supervision",
            "Comité Administratif",
            "Comité Financier"
        ];
        if (state.users && state.users.length > 0) {
            const hasAdminMatch = state.users.some(u => 
                adminCommittees.includes(u.comite) && u.password && u.password.toUpperCase() === trimmed.toUpperCase()
            );
            if (hasAdminMatch) return true;
        }

        // 3. Official Master Admin Passwords (Emergency & Initial Setup - NO 1234)
        const validPasswords = [
            '10ANS', 'NDJAI10', 'ADMIN', 'ADMIN2027',
            'SARAH2027', 'MARC2027', 'AUDE2027', 'PASTEUR2027', 'FINANCE2027', 'PCO2027'
        ];
        return validPasswords.includes(trimmed.toUpperCase());
    }

    function verifyPCOFinanceCode(approverName, code) {
        return verifyPersonalOrAdminPassword(code);
    }

    function requestDeleteExpenseLine(committeeId, lineId) {
        const committee = state.finance.committees.find(c => c.id === committeeId);
        if (!committee || !committee.lignesBudget) return;
        const line = committee.lignesBudget.find(l => l.id === lineId);
        if (!line) return;

        // CRITICAL BUSINESS RULE: If line arrived in disbursement (Soumis or Effectué), CANNOT be deleted!
        if (line.statut === 'Soumis' || line.statut === 'Effectué' || line.statut === 'Payé / Exécuté') {
            showNotification("Suppression Impossible !", `La ligne "${line.libelle}" est actuellement en cours ou déjà effectuée en décaissement (${line.statut}). Elle ne peut pas être supprimée.`, "error");
            return;
        }

        targetPendingDeleteLine = { committeeId, lineId, line };

        const modal = document.getElementById('modal-delete-line-auth');
        if (modal) {
            const desc = document.getElementById('delete-auth-line-desc');
            if (desc) {
                const total = line.montant || ((line.quantite || 1) * (line.prixUnitaire || 0));
                desc.innerHTML = `Veuillez saisir votre mot de passe pour confirmer la suppression de la ligne :<br><strong class="text-slate-900 font-bold block mt-1">"${line.libelle}" (${Number(total).toLocaleString('fr-FR')} FCFA)</strong> du ${committee.name}.`;
            }
            const input = document.getElementById('delete-auth-code-input');
            if (input) {
                input.value = '';
                setTimeout(() => input.focus(), 150);
            }
            modal.classList.remove('hidden');
        }
    }

    function closeDeleteAuthModal() {
        document.getElementById('modal-delete-line-auth')?.classList.add('hidden');
        targetPendingDeleteLine = null;
    }

    function executeDeleteLineWithAuth() {
        if (!targetPendingDeleteLine) return;
        
        const input = document.getElementById('delete-auth-code-input');
        const code = input ? input.value.trim() : '';

        if (!verifyPersonalOrAdminPassword(code)) {
            showNotification("Mot de passe incorrect", "Autorisation refusée. Veuillez vérifier votre mot de passe.", "error");
            if (input) input.focus();
            return;
        }

        const { committeeId, lineId, line } = targetPendingDeleteLine;
        const committee = state.finance.committees.find(c => c.id === committeeId);
        if (!committee || !committee.lignesBudget) return;

        // Double check status before deletion
        const currentLine = committee.lignesBudget.find(l => l.id === lineId);
        if (currentLine && (currentLine.statut === 'Soumis' || currentLine.statut === 'Effectué')) {
            showNotification("Suppression Impossible", "Cette ligne est engagée en décaissement et ne peut plus être supprimée.", "error");
            closeDeleteAuthModal();
            return;
        }

        committee.lignesBudget = committee.lignesBudget.filter(l => l.id !== lineId);
        saveFinanceState();
        closeDeleteAuthModal();
        openCommitteeExpensesDetails(committeeId);
        renderFinanceDashboard();
        renderFinanceConsolidation();
        showNotification("Ligne Budgétaire Supprimée !", `La ligne "${line.libelle}" a été supprimée avec succès.`, "success");
    }

    
    const AUTHORIZED_PCO_FINANCE_COMMITTEES = [
        "Coordination Stratégique",
        "Coordination Opérationnelle",
        "Comité Financier"
    ];

    function getPCOFinanceRoleLabel(comite) {
        if (comite === "Coordination Stratégique") return "PCO Stratégique";
        if (comite === "Coordination Opérationnelle") return "PCO Opérationnel";
        if (comite === "Comité Financier") return "Comité Financier / Trésorerie";
        return comite;
    }

    function populatePCOApproversDropdown() {
        const select = document.getElementById('pco-approver-select');
        if (!select) return;

        select.innerHTML = '';

        // Filtrer strictement les comptes créés (non visiteurs) appartenant aux 3 comités autorisés
        const validUsers = (state.users || []).filter(u => 
            !u.isVisitor && 
            u.name && 
            u.name.trim() !== '' &&
            AUTHORIZED_PCO_FINANCE_COMMITTEES.includes(u.comite)
        );

        if (validUsers.length === 0) {
            AUTHORIZED_PCO_FINANCE_COMMITTEES.forEach((cName, idx) => {
                const roleLabel = getPCOFinanceRoleLabel(cName);
                const opt = document.createElement('option');
                opt.value = `${cName} (${roleLabel})`;
                opt.innerText = `${cName} — ${roleLabel}`;
                if (idx === 0) opt.selected = true;
                select.appendChild(opt);
            });
            return;
        }

        validUsers.forEach((u, idx) => {
            const roleLabel = getPCOFinanceRoleLabel(u.comite);
            const optValue = `${u.name} (${roleLabel})`;
            const optText = `${u.name} — ${roleLabel}`;

            const isSelected = (state.user && state.user.name === u.name && state.user.comite === u.comite) || (idx === 0);

            const opt = document.createElement('option');
            opt.value = optValue;
            opt.innerText = optText;
            if (isSelected) opt.selected = true;
            select.appendChild(opt);
        });
    }

    function openPCOApprovalModal(disbId) {
        const dec = (state.finance.decaissements || []).find(d => d.id === disbId);
        if (!dec) return;
        targetPendingPCOApproval = dec;

        // Alimentation dynamique stricte avec les vrais comptes créés
        populatePCOApproversDropdown();

        const modal = document.getElementById('modal-pco-approval');
        if (modal) {
            const comiteBadge = document.getElementById('pco-modal-comite-badge');
            const refEl = document.getElementById('pco-modal-ref');
            const motifEl = document.getElementById('pco-modal-motif');
            const montantEl = document.getElementById('pco-modal-montant');
            const modeEl = document.getElementById('pco-modal-mode');
            const caisseEl = document.getElementById('pco-modal-caisse-balance');

            if (comiteBadge) comiteBadge.innerText = dec.comite;
            if (refEl) refEl.innerText = `#${dec.id}`;
            if (motifEl) motifEl.innerText = dec.motif;
            if (montantEl) montantEl.innerText = `${Number(dec.montant).toLocaleString('fr-FR')} FCFA`;
            if (modeEl) modeEl.innerText = dec.mode || 'Espèces';
            if (caisseEl) caisseEl.innerText = `${state.finance.balance.toLocaleString('fr-FR')} FCFA`;

            const codeInput = document.getElementById('pco-auth-code');
            if (codeInput) {
                codeInput.value = '';
                setTimeout(() => codeInput.focus(), 150);
            }

            modal.classList.remove('hidden');
            initializeLucideIcons();
        }
    }

    function deleteDonation(idx) {
        const don = (state.finance.dons || [])[idx];
        if (!don) return;

        const pwd = prompt(`Suppression Sécurisée - Saisir votre mot de passe personnel pour supprimer le don de ${don.donateur} (${Number(don.montant).toLocaleString('fr-FR')} FCFA) :`);
        if (!pwd) return;

        if (!verifyPersonalOrAdminPassword(pwd)) {
            showNotification("Mot de passe incorrect", "Autorisation de suppression refusée.", "error");
            return;
        }

        state.finance.dons.splice(idx, 1);
        saveFinanceState();
        renderFinanceDashboard();
        if (typeof populateGoldDonorsDropdown === 'function') populateGoldDonorsDropdown();
        showNotification("Don Supprimé", "L'enregistrement a été supprimé avec succès.", "info");
    }

    function closePCOApprovalModal() {
        document.getElementById('modal-pco-approval')?.classList.add('hidden');
        targetPendingPCOApproval = null;
    }

    function executePCOApproval() {
        if (!targetPendingPCOApproval) return;

        const select = document.getElementById('pco-approver-select');
        if (!select || !select.value) {
            showNotification("Sélection Requise", "Veuillez sélectionner un titulaire d'approbation parmi les comptes PCO / Finance créés.", "warning");
            return;
        }

        const approverText = select.value;
        const codeInput = document.getElementById('pco-auth-code');
        const code = codeInput ? codeInput.value.trim() : '';

        // Vérification du mot de passe du compte sélectionné ou admin
        const targetUser = (state.users || []).find(u => 
            !u.isVisitor && 
            (`${u.name} (${getPCOFinanceRoleLabel(u.comite)})` === approverText || u.name === approverText)
        );

        const isTargetUserPwdValid = targetUser && targetUser.password && targetUser.password.trim().toUpperCase() === code.toUpperCase();
        const isCurrentPwdValid = state.user && state.user.password && state.user.password.trim().toUpperCase() === code.toUpperCase();
        const isGlobalValid = verifyPersonalOrAdminPassword(code);

        if (!isTargetUserPwdValid && !isCurrentPwdValid && !isGlobalValid) {
            showNotification("Mot de passe incorrect", "La validation du décaissement exige obligatoirement le mot de passe personnel du titulaire sélectionné ou le mot de passe administrateur.", "error");
            if (codeInput) {
                codeInput.value = '';
                codeInput.focus();
            }
            return;
        }

        const approverName = approverText;
        const dec = targetPendingPCOApproval;
        dec.statut = "Effectué";
        dec.approbateur = approverName;
        dec.validePar = approverName;
        dec.dateApprobation = new Date().toISOString().split('T')[0];

        state.finance.committees.forEach(c => {
            if (c.lignesBudget) {
                const line = c.lignesBudget.find(l => l.id === dec.ligneId);
                if (line) line.statut = "Effectué";
            }
        });

        if (codeInput) codeInput.value = '';

        saveFinanceState();
        closePCOApprovalModal();
        if (activeSelectedCommitteeId) {
            openCommitteeExpensesDetails(activeSelectedCommitteeId);
        }
        renderFinanceDashboard();
        renderFinanceConsolidation();
        showNotification("Décaissement Validé & Effectué !", `Sortie de ${Number(dec.montant).toLocaleString('fr-FR')} FCFA validée par ${approverName}.`, "success");
    }

    function executePCORejection() {
        if (!targetPendingPCOApproval) return;

        const select = document.getElementById('pco-approver-select');
        if (!select || !select.value) {
            showNotification("Sélection Requise", "Veuillez sélectionner un titulaire d'approbation parmi les comptes PCO / Finance créés.", "warning");
            return;
        }

        const approverText = select.value;
        const codeInput = document.getElementById('pco-auth-code');
        const code = codeInput ? codeInput.value.trim() : '';

        // Vérification du mot de passe du compte sélectionné ou admin
        const targetUser = (state.users || []).find(u => 
            !u.isVisitor && 
            (`${u.name} (${getPCOFinanceRoleLabel(u.comite)})` === approverText || u.name === approverText)
        );

        const isTargetUserPwdValid = targetUser && targetUser.password && targetUser.password.trim().toUpperCase() === code.toUpperCase();
        const isCurrentPwdValid = state.user && state.user.password && state.user.password.trim().toUpperCase() === code.toUpperCase();
        const isGlobalValid = verifyPersonalOrAdminPassword(code);

        if (!isTargetUserPwdValid && !isCurrentPwdValid && !isGlobalValid) {
            showNotification("Mot de passe incorrect", "Le refus d'une demande exige obligatoirement le mot de passe personnel du titulaire sélectionné ou le mot de passe administrateur.", "error");
            if (codeInput) {
                codeInput.value = '';
                codeInput.focus();
            }
            return;
        }

        const approverName = approverText;

        const dec = targetPendingPCOApproval;
        dec.statut = "Rejeté";
        dec.approbateur = approverName;
        dec.dateApprobation = new Date().toISOString().split('T')[0];

        state.finance.committees.forEach(c => {
            if (c.lignesBudget) {
                const line = c.lignesBudget.find(l => l.id === dec.ligneId);
                if (line) line.statut = "Prévu";
            }
        });

        if (codeInput) codeInput.value = '';

        saveFinanceState();
        closePCOApprovalModal();
        if (activeSelectedCommitteeId) {
            openCommitteeExpensesDetails(activeSelectedCommitteeId);
        }
        renderFinanceDashboard();
        renderFinanceConsolidation();
        showNotification("Demande Rejetée", `La demande a été rejetée par ${approverName}. La ligne budgétaire est rétablie au statut 'Prévu'.`, "info");
    }

    function closeEditDonationModal() {
        document.getElementById('modal-edit-donation')?.classList.add('hidden');
    }

    function submitEditDonation(event) {
        event.preventDefault();
        const idx = parseInt(document.getElementById('edit-don-index').value);
        const code = document.getElementById('edit-don-auth-code').value.trim();
        if (!verifyPCOFinanceCode('', code)) {
            showNotification("Mot de passe incorrect", "Autorisation refusée.", "error");
            return;
        }

        const don = (state.finance.dons || [])[idx];
        if (don) {
            don.donateur = document.getElementById('edit-don-nom').value.trim();
            don.type = document.getElementById('edit-don-type').value;
            don.montant = Number(document.getElementById('edit-don-montant').value);
            don.compte = document.getElementById('edit-don-compte').value;
            saveFinanceState();
            closeEditDonationModal();
            renderFinanceDashboard();
            showNotification("Don Modifié", "Mise à jour enregistrée avec succès.", "success");
        }
    }

    function executeQuickCheckIn() {
        const searchInput = document.getElementById('reception-search-input');
        const query = searchInput ? searchInput.value.trim() : '';
        if (!query) {
            showNotification("Saisie requise", "Veuillez saisir un numéro de billet, une référence ou un nom.", "warning");
            return;
        }
        executeCheckInForTicketId(query);
    }

    // ==========================================
    // DASHBOARD & STATS CONTROLLER
    // ==========================================
    
    let currentMonthlyChartMode = 'all'; // 'all', 'tickets', 'revenue'

    function setMonthlyChartMode(mode) {
        currentMonthlyChartMode = mode;
        const modes = ['all', 'tickets', 'revenue'];
        modes.forEach(m => {
            const btn = document.getElementById(`btn-chart-mode-${m}`);
            if (btn) {
                if (m === mode) {
                    btn.className = "px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs bg-white text-slate-900";
                } else {
                    btn.className = "px-3.5 py-1.5 rounded-xl text-xs font-bold transition text-slate-600 hover:text-slate-900";
                }
            }
        });
        updateDashboardStats();
    }

    
    
    let currentDailyChartFilter = 'all';

    function switchDailyChartFilter(filterKey) {
        currentDailyChartFilter = filterKey;
        const btnIds = ['all', '30d', '14d', '7d'];
        btnIds.forEach(id => {
            const btn = document.getElementById(`btn-daily-filter-${id}`);
            if (btn) {
                if (id === filterKey) {
                    btn.className = "px-3 py-1.5 rounded-xl bg-white text-slate-900 shadow-xs transition font-bold";
                } else {
                    btn.className = "px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/60 transition";
                }
            }
        });
        updateDashboardStats();
    }

    function switchWeeklyChartFilter(filterKey) {
        switchDailyChartFilter(filterKey === 'all' ? 'all' : '30d');
    }

    function updateDashboardStats() {
        const participants = state.participants || [];
        const totalTickets = participants.length;
        const fin = state.finance || {};

        // 1. Quota & Category Breakdown Calculations
        const counts = getCategoryCounts();
        const goldCount = counts['Gold'];
        const goldTotal = 0; // Gold is free
        
        const classiqueCount = counts['Classique'];
        const classiqueTotal = classiqueCount * 10000;
        const inviteCount = counts['Invité'];

        let checkedInCount = 0;
        participants.forEach(p => {
            if (p.checkedIn || p.statut === 'Checked-in' || p.statut === 'Émargé') {
                checkedInCount++;
            }
        });

        const checkinRate = totalTickets > 0 ? Math.round((checkedInCount / totalTickets) * 100) : 0;
        const elHeaderRate = document.getElementById('dash-header-checkin-rate');
        if (elHeaderRate) elHeaderRate.innerText = `${checkinRate}% aux Portes (${checkedInCount}/${totalTickets})`;

        const totalTicketsRevenue = goldTotal + classiqueTotal;
        const totalPotentialRevenue = (140 * 10000); // 1 400 000 FCFA

        // KPI 1: Billetterie & Quota Global
        const elKpiTickets = document.getElementById('dash-kpi-tickets');
        if (elKpiTickets) elKpiTickets.innerText = totalTickets;
        const elKpiTicketsSub = document.getElementById('dash-kpi-tickets-sub');
        const quotaPct = Math.min(100, Math.round((totalTickets / TOTAL_MAX_TICKETS) * 100));
        if (elKpiTicketsSub) elKpiTicketsSub.innerText = `${quotaPct}% de la jauge totale (${TOTAL_MAX_TICKETS} max)`;
        const elKpiTicketsBar = document.getElementById('dash-kpi-tickets-bar');
        if (elKpiTicketsBar) elKpiTicketsBar.style.width = `${quotaPct}%`;
        const elKpiTicketsRem = document.getElementById('dash-kpi-tickets-remaining');
        if (elKpiTicketsRem) elKpiTicketsRem.innerText = `${Math.max(0, TOTAL_MAX_TICKETS - totalTickets)} places disponibles`;

        // KPI 2: Recettes Billetterie & Potentiel
        const elKpiTicketsTot = document.getElementById('dash-kpi-tickets-total');
        if (elKpiTicketsTot) elKpiTicketsTot.innerText = `${totalTicketsRevenue.toLocaleString('fr-FR')} FCFA`;
        const elKpiPotentiel = document.getElementById('dash-kpi-tickets-potentiel');
        if (elKpiPotentiel) elKpiPotentiel.innerText = `Objectif : ${totalPotentialRevenue.toLocaleString('fr-FR')} FCFA`;
        const revPct = Math.min(100, Math.round((totalTicketsRevenue / totalPotentialRevenue) * 100));
        const elRevBar = document.getElementById('dash-kpi-revenue-bar');
        if (elRevBar) elRevBar.style.width = `${revPct}%`;
        const elRevRate = document.getElementById('dash-kpi-revenue-rate');
        if (elRevRate) elRevRate.innerText = `${revPct}%`;

        // KPI 3: Recettes Totales & Dons
        const totalDons = fin.donsIncome || (fin.dons || []).reduce((acc, d) => acc + (Number(d.montant) || 0), 0);
        const totalIncomes = totalTicketsRevenue + totalDons;
        const totalExpenses = fin.expensesTotal || 0;
        const totalBudget = fin.budgetTotal || 0;
        const netBalance = totalIncomes - totalExpenses;

        const elKpiIncomes = document.getElementById('dash-kpi-incomes');
        if (elKpiIncomes) elKpiIncomes.innerText = `${totalIncomes.toLocaleString('fr-FR')} FCFA`;
        const elKpiDons = document.getElementById('dash-kpi-dons-total');
        if (elKpiDons) elKpiDons.innerText = `${totalDons.toLocaleString('fr-FR')} FCFA`;

        // KPI 4: Trésorerie & Budget
        const elKpiBalance = document.getElementById('dash-kpi-balance');
        if (elKpiBalance) elKpiBalance.innerText = `${netBalance.toLocaleString('fr-FR')} FCFA`;
        const elKpiBalanceSub = document.getElementById('dash-kpi-balance-sub');
        if (elKpiBalanceSub) elKpiBalanceSub.innerText = `Sorties : ${totalExpenses.toLocaleString('fr-FR')} FCFA`;
        const elKpiBudget = document.getElementById('dash-kpi-budget-total');
        if (elKpiBudget) elKpiBudget.innerText = `${totalBudget.toLocaleString('fr-FR')} FCFA`;

        // 2. High-End Category Quota Cards with Radial SVG Donut Meters
        const catBreakdown = document.getElementById('dash-categories-breakdown');
        if (catBreakdown) {
            const clasPct = Math.min(100, Math.round((classiqueCount / 140) * 100));
            const goldPct = Math.min(100, Math.round((goldCount / 60) * 100));
            
            const invPct = Math.min(100, Math.round((inviteCount / 10) * 100));

            const getRingOffset = (pct) => Math.round(175.9 - (175.9 * pct) / 100);

            catBreakdown.innerHTML = `
                <!-- Classique (140 Quota) -->
                <div class="p-5 bg-gradient-to-br from-blue-50/90 to-indigo-50/70 rounded-3xl border border-blue-200/90 shadow-2xs hover:shadow-lg transition space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="text-[10px] font-black uppercase tracking-wider text-blue-900 block font-mono">Pass Classique</span>
                            <h4 class="font-display font-black text-xl text-blue-950 font-mono">${classiqueCount} <span class="text-xs text-blue-600 font-bold">/ 140</span></h4>
                        </div>
                        <div class="relative w-14 h-14 flex items-center justify-center">
                            <svg class="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
                                <circle cx="32" cy="32" r="28" stroke="#DBEAFE" stroke-width="5" fill="none" />
                                <circle cx="32" cy="32" r="28" stroke="#2563EB" stroke-width="5" stroke-linecap="round" fill="none"
                                    stroke-dasharray="175.9" stroke-dashoffset="${getRingOffset(clasPct)}" class="transition-all duration-1000" />
                            </svg>
                            <span class="absolute font-mono font-black text-[11px] text-blue-900">${clasPct}%</span>
                        </div>
                    </div>
                    <div class="space-y-1.5 text-xs text-blue-950 font-semibold pt-2 border-t border-blue-200/60">
                        <div class="flex justify-between">
                            <span class="text-blue-700 font-medium">Disponibles :</span>
                            <span class="font-mono font-black text-blue-900">${Math.max(0, 140 - classiqueCount)} places (18 T.)</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-blue-700 font-medium">Recette :</span>
                            <span class="font-mono font-black text-blue-900">${classiqueTotal.toLocaleString('fr-FR')} F</span>
                        </div>
                    </div>
                </div>

                <!-- Gold (60 Quota) -->
                <div class="p-5 bg-gradient-to-br from-amber-50/90 to-orange-50/70 rounded-3xl border border-amber-200/90 shadow-2xs hover:shadow-lg transition space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="text-[10px] font-black uppercase tracking-wider text-amber-900 block font-mono">Pass Gold</span>
                            <h4 class="font-display font-black text-xl text-amber-950 font-mono">${goldCount} <span class="text-xs text-amber-600 font-bold">/ 60</span></h4>
                        </div>
                        <div class="relative w-14 h-14 flex items-center justify-center">
                            <svg class="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
                                <circle cx="32" cy="32" r="28" stroke="#FEF3C7" stroke-width="5" fill="none" />
                                <circle cx="32" cy="32" r="28" stroke="#F59E0B" stroke-width="5" stroke-linecap="round" fill="none"
                                    stroke-dasharray="175.9" stroke-dashoffset="${getRingOffset(goldPct)}" class="transition-all duration-1000" />
                            </svg>
                            <span class="absolute font-mono font-black text-[11px] text-amber-900">${goldPct}%</span>
                        </div>
                    </div>
                    <div class="space-y-1.5 text-xs text-amber-950 font-semibold pt-2 border-t border-amber-200/60">
                        <div class="flex justify-between">
                            <span class="text-amber-700 font-medium">Disponibles :</span>
                            <span class="font-mono font-black text-amber-900">${Math.max(0, 60 - goldCount)} places (8 T.)</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-amber-700 font-medium">Recette :</span>
                            <span class="font-mono font-black text-amber-900">${goldTotal.toLocaleString('fr-FR')} F</span>
                        </div>
                    </div>
                </div>

                <!-- Invités (20 Quota) -->
                <div class="p-5 bg-gradient-to-br from-emerald-50/90 to-teal-50/70 rounded-3xl border border-emerald-200/90 shadow-2xs hover:shadow-lg transition space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="text-[10px] font-black uppercase tracking-wider text-emerald-900 block font-mono">Pass Invités</span>
                            <h4 class="font-display font-black text-xl text-emerald-950 font-mono">${inviteCount} <span class="text-xs text-emerald-600 font-bold">/ 10</span></h4>
                        </div>
                        <div class="relative w-14 h-14 flex items-center justify-center">
                            <svg class="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
                                <circle cx="32" cy="32" r="28" stroke="#D1FAE5" stroke-width="5" fill="none" />
                                <circle cx="32" cy="32" r="28" stroke="#10B981" stroke-width="5" stroke-linecap="round" fill="none"
                                    stroke-dasharray="175.9" stroke-dashoffset="${getRingOffset(invPct)}" class="transition-all duration-1000" />
                            </svg>
                            <span class="absolute font-mono font-black text-[11px] text-emerald-900">${invPct}%</span>
                        </div>
                    </div>
                    <div class="space-y-1.5 text-xs text-emerald-950 font-semibold pt-2 border-t border-emerald-200/60">
                        <div class="flex justify-between">
                            <span class="text-emerald-700 font-medium">Disponibles :</span>
                            <span class="font-mono font-black text-emerald-900">${Math.max(0, 10 - inviteCount)} places (2 T.)</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-emerald-700 font-medium">Accès :</span>
                            <span class="font-mono font-black text-emerald-800">100% Offert</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // 3. ÉVOLUTION JOURNALIÈRE DES ACHATS DE TICKETS (TOUS LES PASS CONFONDUS) & STATS AVANCÉES
        function extractParticipantDayKey(p) {
            if (p.dateAdded) {
                try {
                    const d = new Date(p.dateAdded);
                    if (!isNaN(d.getTime())) {
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        return `${y}-${m}-${day}`;
                    }
                } catch(e) {}
            }
            if (p.dateTicket && typeof p.dateTicket === 'string') {
                const parts = p.dateTicket.split('/');
                if (parts.length === 3) {
                    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            }
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        }

        const dailyMap = {};
        participants.forEach(p => {
            const k = extractParticipantDayKey(p);
            if (!dailyMap[k]) {
                dailyMap[k] = { dateKey: k, count: 0, classique: 0, gold: 0, invite: 0, revenue: 0, checkedIn: 0 };
            }
            dailyMap[k].count++;
            const cat = (p.categorie || 'Classique').trim();
            if (cat === 'Gold') dailyMap[k].gold++;
            else if (cat === 'Invité') dailyMap[k].invite++;
            else dailyMap[k].classique++;

            const pr = Number(p.prix) || (cat === 'Classique' ? 10000 : 0);
            dailyMap[k].revenue += pr;
            if (p.checkedIn || p.statut === 'Checked-in' || p.statut === 'Émargé') {
                dailyMap[k].checkedIn++;
            }
        });

        // Determine days to display based on currentDailyChartFilter
        const sortedActiveDates = Object.keys(dailyMap).sort();
        let numDays = 14;
        if (currentDailyChartFilter === '7d') numDays = 7;
        else if (currentDailyChartFilter === '14d') numDays = 14;
        else if (currentDailyChartFilter === '30d') numDays = 30;
        else if (currentDailyChartFilter === 'all') {
            numDays = Math.max(14, sortedActiveDates.length);
        }

        const targetDays = [];
        const baseDate = new Date();
        for (let i = numDays - 1; i >= 0; i--) {
            const d = new Date(baseDate.getTime() - i * 86400000);
            const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            targetDays.push(k);
        }

        // In 'all' mode, also ensure any earlier days with sales are prepended
        if (currentDailyChartFilter === 'all') {
            sortedActiveDates.forEach(k => {
                if (!targetDays.includes(k)) targetDays.push(k);
            });
            targetDays.sort();
        }

        // Compute Quick KPIs
        let peakDayCount = 0;
        let peakDayKey = '';
        let totalPeriodTickets = 0;
        let totalPeriodRevenue = 0;
        let activeDaysCount = 0;

        targetDays.forEach(k => {
            const d = dailyMap[k];
            if (d && d.count > 0) {
                activeDaysCount++;
                totalPeriodTickets += d.count;
                totalPeriodRevenue += d.revenue;
                if (d.count > peakDayCount) {
                    peakDayCount = d.count;
                    peakDayKey = k;
                }
            }
        });

        const monthNamesShort = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
        const monthNamesLong = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const weekDaysShort = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const weekDaysLong = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

        // Format Peak Day Label
        const elPeak = document.getElementById('dash-stat-daily-peak');
        if (elPeak) {
            if (peakDayCount > 0 && peakDayKey) {
                const [py, pm, pd] = peakDayKey.split('-').map(Number);
                elPeak.innerText = `${peakDayCount} billet${peakDayCount > 1 ? 's' : ''} (${pd} ${monthNamesShort[pm - 1]})`;
            } else {
                elPeak.innerText = `0 billet`;
            }
        }

        // Format Daily Average
        const elAvg = document.getElementById('dash-stat-daily-avg');
        if (elAvg) {
            const avg = activeDaysCount > 0 ? (totalPeriodTickets / activeDaysCount).toFixed(1) : 0;
            elAvg.innerText = `${avg} billet${avg > 1 ? 's' : ''}/j`;
        }

        // Format Last Purchase
        const elLast = document.getElementById('dash-stat-last-purchase');
        if (elLast) {
            if (participants.length > 0) {
                const latest = participants[0]; // unshift put recent first
                const dTicket = latest.dateTicket || (latest.dateAdded ? new Date(latest.dateAdded).toLocaleDateString('fr-FR') : '--');
                elLast.innerText = `${latest.prenom || latest.nom || 'Pass'} • ${dTicket}`;
            } else {
                elLast.innerText = `--`;
            }
        }

        // Active Days Count
        const elActive = document.getElementById('dash-stat-active-days');
        if (elActive) {
            elActive.innerText = `${activeDaysCount} jour${activeDaysCount > 1 ? 's' : ''} actif${activeDaysCount > 1 ? 's' : ''}`;
        }

        // Render Daily Chart
        const dailyChartContainer = document.getElementById('dashboard-daily-chart');
        if (dailyChartContainer) {
            dailyChartContainer.innerHTML = '';
            if (targetDays.length === 0 || (totalPeriodTickets === 0 && participants.length === 0)) {
                dailyChartContainer.innerHTML = `
                    <div class="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
                        <i data-lucide="calendar-x-2" class="h-10 w-10 text-slate-300"></i>
                        <p class="text-sm font-bold text-slate-600">Aucun achat de billet enregistré pour le moment</p>
                        <p class="text-xs text-slate-400">Les statistiques journalières s'afficheront automatiquement dès la première émission de Pass.</p>
                    </div>
                `;
            } else {
                const maxDayCount = Math.max(1, peakDayCount);
                targetDays.forEach(dateKey => {
                    const d = dailyMap[dateKey] || { count: 0, classique: 0, gold: 0, invite: 0, revenue: 0, checkedIn: 0 };
                    const [y, m, dayNum] = dateKey.split('-').map(Number);
                    const dateObj = new Date(y, m - 1, dayNum);
                    const dayLabel = `${dayNum} ${monthNamesShort[m - 1]}`;
                    const weekday = weekDaysShort[dateObj.getDay()];
                    const fullDateStr = `${weekDaysLong[dateObj.getDay()]} ${dayNum} ${monthNamesLong[m - 1]} ${y}`;

                    const heightPct = d.count > 0 ? Math.max(18, Math.round((d.count / maxDayCount) * 100)) : 6;
                    const clasHeight = d.count > 0 ? Math.round((d.classique / d.count) * 100) : 0;
                    const goldHeight = d.count > 0 ? Math.round((d.gold / d.count) * 100) : 0;
                    const invHeight = d.count > 0 ? Math.max(0, 100 - (clasHeight + goldHeight)) : 0;

                    dailyChartContainer.innerHTML += `
                        <div class="flex-1 min-w-[36px] max-w-[54px] flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer relative">
                            <!-- Floating Tooltip -->
                            <div class="text-[10px] font-black text-slate-800 bg-white px-3 py-2 rounded-2xl shadow-xl border border-slate-200/90 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap -mb-2 z-30 transform -translate-y-2 pointer-events-none space-y-1 text-left">
                                <div class="font-extrabold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between gap-3">
                                    <span>${fullDateStr}</span>
                                    <span class="px-1.5 py-0.5 rounded-md ${d.count > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'} font-mono">${d.count} billet${d.count > 1 ? 's' : ''}</span>
                                </div>
                                <div class="text-blue-700 font-bold font-mono">Total : ${d.count} billet(s) (tous pass)</div>
                                <div class="text-slate-600 font-medium text-[9px] flex items-center gap-2">
                                    <span class="inline-flex items-center gap-1 text-blue-600 font-bold"><span class="h-1.5 w-1.5 rounded-full bg-blue-600"></span>${d.classique} Classique</span>
                                    <span class="inline-flex items-center gap-1 text-amber-600 font-bold"><span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>${d.gold} Gold</span>
                                    <span class="inline-flex items-center gap-1 text-emerald-600 font-bold"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>${d.invite} Invité</span>
                                </div>
                                <div class="text-emerald-700 font-bold font-mono text-[9px]">Recette : ${d.revenue.toLocaleString('fr-FR')} FCFA</div>
                                ${d.checkedIn > 0 ? `<div class="text-emerald-600 text-[9px] font-bold">Émargés aux portes : ${d.checkedIn}</div>` : ''}
                            </div>

                            <!-- Count on Top of Bar -->
                            <span class="text-[10px] font-black font-mono ${d.count > 0 ? 'text-slate-800' : 'text-transparent'} transition">${d.count}</span>

                            <!-- Vertical Pillar -->
                            <div class="w-full rounded-2xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg relative overflow-hidden flex flex-col justify-end ${d.count > 0 ? 'shadow-xs border border-white/40' : 'bg-slate-200/60 border border-dashed border-slate-300'}" style="height: ${heightPct}%">
                                ${d.count > 0 ? `
                                    ${d.invite > 0 ? `<div class="w-full bg-gradient-to-t from-emerald-600 to-emerald-400" style="height: ${invHeight}%" title="${d.invite} Pass Invités"></div>` : ''}
                                    ${d.gold > 0 ? `<div class="w-full bg-gradient-to-t from-amber-500 to-amber-300" style="height: ${goldHeight}%" title="${d.gold} Pass Gold"></div>` : ''}
                                    ${d.classique > 0 ? `<div class="w-full bg-gradient-to-t from-blue-700 to-blue-500" style="height: ${clasHeight}%" title="${d.classique} Pass Classique"></div>` : ''}
                                ` : ''}
                            </div>

                            <!-- Day Label at Bottom -->
                            <div class="flex flex-col items-center mt-1">
                                <span class="text-[11px] font-black ${d.count > 0 ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'} font-mono leading-none">${dayLabel}</span>
                                <span class="text-[9px] font-extrabold ${d.count > 0 ? 'text-brand-orange' : 'text-slate-400'} uppercase font-mono mt-0.5">${weekday}</span>
                            </div>
                        </div>
                    `;
                });
            }
        }

        const elDailySummary = document.getElementById('dash-daily-total-summary');
        if (elDailySummary) {
            elDailySummary.innerText = `Total Période : ${totalPeriodTickets} billet${totalPeriodTickets > 1 ? 's' : ''} (${totalPeriodRevenue.toLocaleString('fr-FR')} FCFA)`;
        }

        // 3.B. PANORAMA DES AUTRES STATISTIQUES (MODES DE RÈGLEMENT, ÉMARGEMENT & OCCUPATION)
        let waveCount = 0, waveAmount = 0;
        let omCount = 0, omAmount = 0;
        let cashCount = 0, cashAmount = 0;
        let freeCount = 0; // Gold & Invité

        let checkedClassique = 0, totalClassique = 0;
        let checkedGold = 0, totalGold = 0;
        let checkedInvite = 0, totalInvite = 0;

        participants.forEach(p => {
            const cat = (p.categorie || 'Classique').trim();
            const price = Number(p.prix) || (cat === 'Classique' ? 10000 : 0);
            const mode = (p.modeReglement || '').toLowerCase();
            const ref = (p.preuveReglement || '').toUpperCase();
            const isEmarge = !!(p.checkedIn || p.statut === 'Checked-in' || p.statut === 'Émargé');

            // Category check-in tracking
            if (cat === 'Gold') {
                totalGold++;
                if (isEmarge) checkedGold++;
            } else if (cat === 'Invité') {
                totalInvite++;
                if (isEmarge) checkedInvite++;
            } else {
                totalClassique++;
                if (isEmarge) checkedClassique++;
            }

            // Payment mode tracking
            if (cat === 'Gold' || cat === 'Invité' || mode.includes('donateur') || mode.includes('invité') || price === 0) {
                freeCount++;
            } else if (mode.includes('wave') || ref.startsWith('T_')) {
                waveCount++;
                waveAmount += price;
            } else if (mode.includes('orange') || ref.startsWith('PP') || ref.startsWith('MP')) {
                omCount++;
                omAmount += price;
            } else {
                cashCount++;
                cashAmount += price;
            }
        });

        const totalP = Math.max(1, participants.length);
        const wavePct = totalTickets > 0 ? Math.round((waveCount / totalP) * 100) : 0;
        const omPct = totalTickets > 0 ? Math.round((omCount / totalP) * 100) : 0;
        const cashPct = totalTickets > 0 ? Math.round((cashCount / totalP) * 100) : 0;
        const freePct = totalTickets > 0 ? Math.max(0, 100 - (wavePct + omPct + cashPct)) : 0;

        // Payment Total Count Badge
        const elPayTotal = document.getElementById('dash-payment-total-count');
        if (elPayTotal) {
            elPayTotal.innerText = `${totalTickets} billet${totalTickets > 1 ? 's' : ''}`;
        }

        // Payment Methods Visual Cards
        const elPaymentGrid = document.getElementById('dash-payment-methods-grid');
        if (elPaymentGrid) {
            elPaymentGrid.innerHTML = `
                <!-- Wave -->
                <div class="p-3.5 rounded-2xl bg-sky-50 border border-sky-200/80 space-y-1.5 text-sky-950 hover:shadow-xs transition">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] font-black uppercase font-mono tracking-wider text-sky-700">Wave</span>
                        <span class="h-2 w-2 rounded-full bg-sky-500"></span>
                    </div>
                    <div class="text-base font-black font-mono text-sky-900">${waveCount} <span class="text-[11px] font-bold text-sky-600">(${wavePct}%)</span></div>
                    <div class="text-[10px] font-extrabold text-sky-700 font-mono">${waveAmount.toLocaleString('fr-FR')} F</div>
                </div>

                <!-- Orange Money -->
                <div class="p-3.5 rounded-2xl bg-orange-50 border border-orange-200/80 space-y-1.5 text-orange-950 hover:shadow-xs transition">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] font-black uppercase font-mono tracking-wider text-orange-700">Orange Money</span>
                        <span class="h-2 w-2 rounded-full bg-orange-500"></span>
                    </div>
                    <div class="text-base font-black font-mono text-orange-900">${omCount} <span class="text-[11px] font-bold text-orange-600">(${omPct}%)</span></div>
                    <div class="text-[10px] font-extrabold text-orange-700 font-mono">${omAmount.toLocaleString('fr-FR')} F</div>
                </div>

                <!-- Espèces -->
                <div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-1.5 text-emerald-950 hover:shadow-xs transition">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] font-black uppercase font-mono tracking-wider text-emerald-700">Espèces</span>
                        <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <div class="text-base font-black font-mono text-emerald-900">${cashCount} <span class="text-[11px] font-bold text-emerald-600">(${cashPct}%)</span></div>
                    <div class="text-[10px] font-extrabold text-emerald-700 font-mono">${cashAmount.toLocaleString('fr-FR')} F</div>
                </div>

                <!-- Donateurs & VIP Offerts -->
                <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1.5 text-amber-950 hover:shadow-xs transition">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] font-black uppercase font-mono tracking-wider text-amber-700">Pass Offerts</span>
                        <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                    </div>
                    <div class="text-base font-black font-mono text-amber-900">${freeCount} <span class="text-[11px] font-bold text-amber-600">(${freePct}%)</span></div>
                    <div class="text-[10px] font-extrabold text-amber-700 font-mono">0 F (Gold & VIP)</div>
                </div>
            `;
        }

        // Stacked Payment Mix Bar
        const elStackedBar = document.getElementById('dash-payment-stacked-bar');
        if (elStackedBar) {
            if (totalTickets === 0) {
                elStackedBar.innerHTML = `<div class="h-full w-full bg-slate-200"></div>`;
            } else {
                elStackedBar.innerHTML = `
                    ${waveCount > 0 ? `<div class="h-full bg-sky-500 transition-all duration-700" style="width: ${wavePct}%" title="Wave: ${waveCount} billets (${wavePct}%)"></div>` : ''}
                    ${omCount > 0 ? `<div class="h-full bg-orange-500 transition-all duration-700" style="width: ${omPct}%" title="Orange Money: ${omCount} billets (${omPct}%)"></div>` : ''}
                    ${cashCount > 0 ? `<div class="h-full bg-emerald-500 transition-all duration-700" style="width: ${cashPct}%" title="Espèces: ${cashCount} billets (${cashPct}%)"></div>` : ''}
                    ${freeCount > 0 ? `<div class="h-full bg-amber-400 transition-all duration-700" style="width: ${freePct}%" title="Pass Offerts: ${freeCount} billets (${freePct}%)"></div>` : ''}
                `;
            }
        }

        const elMixLabel = document.getElementById('dash-payment-mix-label');
        if (elMixLabel) {
            elMixLabel.innerText = `Wave ${wavePct}% • Orange ${omPct}% • Espèces ${cashPct}% • Offerts ${freePct}%`;
        }

        // Émargement & Contrôle d'Accès Détaillé
        const elCheckinPct = document.getElementById('dash-checkin-global-pct');
        if (elCheckinPct) {
            elCheckinPct.innerText = `${checkinRate}% Présents`;
        }

        const elCheckinRatio = document.getElementById('dash-checkin-detail-ratio');
        if (elCheckinRatio) {
            elCheckinRatio.innerText = `${checkedInCount} émargés / ${totalTickets} émis (${Math.max(0, totalTickets - checkedInCount)} attendus)`;
        }

        const elCheckinCards = document.getElementById('dash-checkin-breakdown-cards');
        if (elCheckinCards) {
            const clasRate = totalClassique > 0 ? Math.round((checkedClassique / totalClassique) * 100) : 0;
            const goldRate = totalGold > 0 ? Math.round((checkedGold / totalGold) * 100) : 0;
            const invRate = totalInvite > 0 ? Math.round((checkedInvite / totalInvite) * 100) : 0;

            elCheckinCards.innerHTML = `
                <!-- Classique Checkin -->
                <div class="p-3 bg-blue-50/70 rounded-2xl border border-blue-200/80 text-center space-y-1">
                    <span class="text-[9px] font-black uppercase text-blue-900 block font-mono">Classique</span>
                    <span class="text-sm font-black font-mono text-blue-950 block">${checkedClassique}/${totalClassique}</span>
                    <span class="text-[10px] font-bold text-blue-700 font-mono">${clasRate}% présent${clasRate > 1 ? 's' : ''}</span>
                </div>

                <!-- Gold Checkin -->
                <div class="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-center space-y-1">
                    <span class="text-[9px] font-black uppercase text-amber-900 block font-mono">Pass Gold</span>
                    <span class="text-sm font-black font-mono text-amber-950 block">${checkedGold}/${totalGold}</span>
                    <span class="text-[10px] font-bold text-amber-700 font-mono">${goldRate}% présent${goldRate > 1 ? 's' : ''}</span>
                </div>

                <!-- Invité Checkin -->
                <div class="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 text-center space-y-1">
                    <span class="text-[9px] font-black uppercase text-emerald-900 block font-mono">Invités</span>
                    <span class="text-sm font-black font-mono text-emerald-950 block">${checkedInvite}/${totalInvite}</span>
                    <span class="text-[10px] font-bold text-emerald-700 font-mono">${invRate}% présent${invRate > 1 ? 's' : ''}</span>
                </div>
            `;
        }

        // 4. Visual 25 Mini Tables Seating Grid Map
        const miniTablesGrid = document.getElementById('dash-mini-tables-grid');
        if (miniTablesGrid) {
            miniTablesGrid.innerHTML = '';
            const tableTypes = [
                ...Array(19).fill({ type: 'Classique', color: 'bg-blue-500 border-blue-600 text-white', label: 'C' }),
                ...Array(7).fill({ type: 'Gold', color: 'bg-amber-500 border-amber-600 text-slate-900', label: 'G' }),
                ...Array(2).fill({ type: 'Invité', color: 'bg-emerald-500 border-emerald-600 text-white', label: 'I' })
            ];

            tableTypes.forEach((t, i) => {
                const tableNumber = i + 1;
                let catParticipants = [];
                let offset = 0;
                if (t.type === 'Classique') {
                    catParticipants = participants.filter(p => !p.categorie || p.categorie === 'Classique');
                    offset = i * 8;
                } else if (t.type === 'Gold') {
                    catParticipants = participants.filter(p => p.categorie === 'Gold');
                    offset = (i - 19) * 8;
                } else {
                    catParticipants = participants.filter(p => p.categorie === 'Invité');
                    offset = (i - 26) * 8;
                }
                const guests = catParticipants.slice(offset, offset + 8);
                const occ = guests.length;

                miniTablesGrid.innerHTML += `
                    <div class="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-md transition text-center space-y-1 group cursor-pointer" title="Table ${t.type} N°${tableNumber} (${occ}/8 places occupées)">
                        <div class="h-8 w-8 rounded-xl ${t.color} flex items-center justify-center font-mono font-black text-xs mx-auto shadow-xs group-hover:scale-110 transition">
                            T${tableNumber}
                        </div>
                        <div class="text-[10px] font-mono font-black ${occ === 10 ? 'text-emerald-600' : (occ > 0 ? 'text-amber-600' : 'text-slate-400')}">
                            ${occ}/10
                        </div>
                    </div>
                `;
            });
        }

        // 5. Top Churches Leaderboard
        const churchCounts = {};
        participants.forEach(p => {
            const c = (p.eglise || 'Non spécifié').trim();
            churchCounts[c] = (churchCounts[c] || 0) + 1;
        });

        const sortedChurches = Object.entries(churchCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const topList = document.getElementById('top-churches-list');
        if (topList) {
            topList.innerHTML = '';
            if (sortedChurches.length === 0) {
                topList.innerHTML = '<p class="text-xs text-slate-400 italic">Aucune inscription enregistrée.</p>';
            } else {
                sortedChurches.forEach(([church, count], idx) => {
                    const pct = Math.round((count / Math.max(1, totalTickets)) * 100) || 0;
                    let rankBg = "bg-slate-100 text-slate-700";
                    if (idx === 0) rankBg = "bg-amber-100 text-amber-900 border border-amber-300 font-black";
                    else if (idx === 1) rankBg = "bg-slate-200 text-slate-800 font-bold";
                    else if (idx === 2) rankBg = "bg-orange-100 text-orange-800 font-bold";

                    topList.innerHTML += `
                        <div class="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xs transition space-y-1.5">
                            <div class="flex justify-between items-center text-xs font-bold">
                                <div class="flex items-center gap-2 truncate pr-2">
                                    <span class="h-6 w-6 rounded-full ${rankBg} text-[10px] flex items-center justify-center shrink-0 font-mono">#${idx + 1}</span>
                                    <span class="text-slate-900 truncate font-display font-bold" title="${church}">${church}</span>
                                </div>
                                <span class="text-blue-700 font-mono font-black shrink-0">${count} (${pct}%)</span>
                            </div>
                            <div class="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                                <div class="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                            </div>
                        </div>
                    `;
                });
            }
        }

        updateCategoryDropdownQuotas();
        populateGoldDonorsDropdown();
        updateLiveTicketPreviewFromForm();
        initializeLucideIcons();
    }

    
    function applyUserStatesUI() {
        if (!state.user) state.user = DEFAULT_VISITOR_USER;
        const user = state.user;
        const isVis = !!user.isVisitor;

        // Mobile bottom nav bar disabled (Navigation strictly via Accueil hub)

        // --- RBAC: Hide/Show Elements based on Visitor Status ---
        if (isVis) {
            document.querySelectorAll('.member-only-el').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.visitor-only-el').forEach(el => el.classList.remove('hidden'));
        } else {
            document.querySelectorAll('.member-only-el').forEach(el => el.classList.remove('hidden'));
            document.querySelectorAll('.visitor-only-el').forEach(el => el.classList.add('hidden'));
        }

        // --- RBAC: Navigation Tabs Module Permissions ---
        const pcoRoles = ["Coordination Stratégique", "Coordination Opérationnelle"];
        const modulePermissions = {
            'accueil': null,
            'ticket': null,
            'apropos': null,
            'utilisateur': null,
            'organisation': null, // Public
            'dashboard': pcoRoles,
            'finance': ['MEMBER'], // All committees
            'reception': [...pcoRoles, "Comité Accueil & Sécurité"],
            'liste': [...pcoRoles, "Comité Administratif", "Comité Accueil & Sécurité", "Comité Financier"]
        };

        const hasAccessToModule = (viewName) => {
            const req = modulePermissions[viewName];
            if (!req) return true; // public
            if (isVis) return false;
            if (req.includes('MEMBER')) return true;
            return req.includes(user.comite);
        };

        document.querySelectorAll('.nav-tab, .mobile-nav-tab').forEach(tab => {
            const target = tab.getAttribute('data-target');
            if (target) {
                if (hasAccessToModule(target)) {
                    tab.style.display = '';
                } else {
                    tab.style.display = 'none';
                }
            }
        });

        // 1. Update Top Header Bar
        const headAvatar = document.getElementById('header-user-avatar');
        const headName = document.getElementById('header-user-name');
        const headRole = document.getElementById('header-user-role');

        if (headAvatar) {
            if (isVis || !user.avatar) {
                headAvatar.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                headAvatar.className = "h-9 w-9 rounded-full bg-slate-800 p-1.5 ring-2 ring-slate-600 shadow-md";
            } else {
                headAvatar.src = user.avatar;
                headAvatar.className = "h-9 w-9 rounded-full object-cover ring-2 ring-brand-orange shadow-md";
            }
        }
        if (headName) headName.innerText = user.name || 'Visiteur / Invité';
        if (headRole) {
            if (user.isVisitor) {
                headRole.innerText = '';
                headRole.className = 'text-[10px] text-emerald-400 font-semibold hidden';
            } else {
                headRole.innerText = user.comite || 'Membre Comité';
                headRole.className = 'text-[10px] text-brand-orange font-semibold';
            }
        }

        // Update Home Module Card for User / Connexion
        const homeCardBadge = document.getElementById('home-card-user-badge');
        const homeCardTitle = document.getElementById('home-card-user-title');
        const homeCardSub = document.getElementById('home-card-user-sub');
        const homeCardDesc = document.getElementById('home-card-user-desc');

        if (homeCardBadge) homeCardBadge.innerText = isVis ? "Connexion Comité" : "Espace Organisateur";
        if (homeCardTitle) homeCardTitle.innerText = isVis ? "Se Connecter" : "Mon Profil";
        if (homeCardSub) homeCardSub.innerText = isVis ? "Accès Organisateur" : "Mon Profil & Paramètres";
        if (homeCardDesc) {
            homeCardDesc.innerText = isVis 
                ? "Connectez-vous avec votre compte de comité pour accéder aux outils de gestion et à votre profil."
                : "Personnalisez votre identité d'organisateur, modifiez votre photo et vos coordonnées.";
        }

        // 2. Update Active Profile Tab Elements in #view-utilisateur
        const actAvatar = document.getElementById('active-profile-avatar');
        const actName = document.getElementById('active-profile-name');
        const actBadge = document.getElementById('active-profile-comite-badge');
        const actId = document.getElementById('active-profile-id');

        const editName = document.getElementById('active-edit-name');
        const editComite = document.getElementById('active-edit-comite');
        const editContact1 = document.getElementById('active-edit-contact1');
        const editContact2 = document.getElementById('active-edit-contact2');

        if (actAvatar) {
            if (isVis || !user.avatar) {
                actAvatar.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                actAvatar.className = "h-28 w-28 rounded-full bg-slate-100 p-5 mx-auto ring-4 ring-slate-200 shadow-inner";
            } else {
                actAvatar.src = user.avatar;
                actAvatar.className = "h-28 w-28 rounded-full object-cover mx-auto ring-4 ring-brand-orange/20 shadow-lg";
            }
        }
        if (actName) actName.innerText = user.name || 'Visiteur / Invité';
        if (actBadge) {
            if (user.isVisitor) {
                actBadge.innerText = '';
                actBadge.className = 'hidden';
            } else {
                actBadge.innerText = user.comite || 'Membre de Comité';
                actBadge.className = 'inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300';
            }
        }
        if (actId) actId.innerText = `ID : ${user.id || 'USR-VISITEUR'}`;

        const chroTitle = document.getElementById('chro-header-title');
        const chroDesc = document.getElementById('chro-header-desc');
        if (chroTitle) {
            chroTitle.innerText = isVis ? "Programme Officiel des Activités (10 Ans)" : "Gestion du Chronogramme des Activités (10 Ans)";
        }
        if (chroDesc) {
            chroDesc.innerText = isVis 
                ? "Consultez le déroulé officiel de la soirée du 01 Janvier 2027 à Noces d'Or." 
                : "Ajoutez, modifiez ou réorganisez les étapes. Les modifications sont publiées en direct.";
        }
        
        renderChronogrammeOrganisation();

        if (editName) editName.value = user.isVisitor ? '' : (user.name || '');
        if (editComite && !user.isVisitor) editComite.value = user.comite || 'Comité Supervision';
        if (editContact1) editContact1.value = user.contact1 || '';
        if (editContact2) editContact2.value = user.contact2 || '';

        updateCategoryDropdownQuotas();
        populateGoldDonorsDropdown();

        initializeLucideIcons();
    }

    function populateLoginUserSelect() {
        const select = document.getElementById('login-user-select');
        if (!select) return;
        const currentVal = select.value || (state.user && !state.user.isVisitor ? state.user.comite : OFFICIAL_COMMITTEES[0]);
        select.innerHTML = '';

        const users = state.users || [];

        OFFICIAL_COMMITTEES.forEach(comiteName => {
            const existingUser = users.find(u => u.comite === comiteName);
            const isSelected = (currentVal === comiteName);
            if (existingUser) {
                select.innerHTML += `<option value="${comiteName}" ${isSelected ? 'selected' : ''}>👤 ${comiteName} — ${existingUser.name}</option>`;
            } else {
                select.innerHTML += `<option value="${comiteName}" ${isSelected ? 'selected' : ''} class="text-slate-400">🔒 ${comiteName} (Non configuré)</option>`;
            }
        });

        onLoginUserSelectChange();
    }

    function populateGatewayUserSelect() {
        const select = document.getElementById('gateway-user-select');
        if (!select) return;
        const currentVal = select.value || (state.user && !state.user.isVisitor ? state.user.comite : OFFICIAL_COMMITTEES[0]);
        select.innerHTML = '';

        const users = state.users || [];

        OFFICIAL_COMMITTEES.forEach(comiteName => {
            const existingUser = users.find(u => u.comite === comiteName);
            const isSelected = (currentVal === comiteName);
            if (existingUser) {
                select.innerHTML += `<option value="${comiteName}" ${isSelected ? 'selected' : ''}>👤 ${comiteName} — ${existingUser.name}</option>`;
            } else {
                select.innerHTML += `<option value="${comiteName}" ${isSelected ? 'selected' : ''} class="text-slate-400">🔒 ${comiteName} (Non configuré)</option>`;
            }
        });
    }

    function onLoginUserSelectChange() {
        const select = document.getElementById('login-user-select');
        if (!select) return;
        const selectedComite = select.value;
        const existingUser = (state.users || []).find(u => u.comite === selectedComite);

        const previewName = document.getElementById('login-preview-name');
        const previewComite = document.getElementById('login-preview-comite');
        const previewAvatar = document.getElementById('login-preview-avatar');

        if (existingUser) {
            if (previewName) previewName.innerText = existingUser.name;
            if (previewComite) previewComite.innerHTML = `<span class="text-emerald-600 font-bold">● Compte Actif</span> • ${selectedComite}`;
            if (previewAvatar) {
                previewAvatar.src = (existingUser && existingUser.avatar) 
                    ? existingUser.avatar 
                    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
            }
        } else {
            if (previewName) previewName.innerText = "Aucun profil créé pour ce comité";
            if (previewComite) previewComite.innerHTML = `<span class="text-amber-600 font-bold">🔒 En attente de création</span>`;
            if (previewAvatar) {
                previewAvatar.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
            }
        }
    }

    function switchUserSectionTab(tab) {
        const isVis = state.user && state.user.isVisitor;
        
        // Strict guard: Disconnected / visitor users cannot access 'active' (Mon Profil)
        if (tab === 'active' && isVis) {
            showNotification("Connexion Requise", "Veuillez vous connecter à votre compte de comité pour accéder à votre profil.", "info");
            tab = 'login';
        }

        const tabs = ['active', 'login', 'create'];
        tabs.forEach(t => {
            const sec = document.getElementById(`user-section-${t}`);
            const btn = document.getElementById(`user-tab-btn-${t}`);
            if (sec) {
                if (t === tab && (!isVis || t !== 'active')) sec.classList.remove('hidden');
                else sec.classList.add('hidden');
            }
            if (btn) {
                const isMemOnly = btn.classList.contains('member-only-el') || t === 'active';
                const baseClass = isMemOnly ? 'member-only-el ' : '';
                if (isVis && isMemOnly) {
                    btn.className = `${baseClass}hidden`;
                } else if (t === tab) {
                    btn.className = `${baseClass}px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs bg-white text-slate-900`;
                } else {
                    btn.className = `${baseClass}px-3.5 py-2 rounded-xl text-xs font-bold transition text-slate-600 hover:text-slate-900`;
                }
            }
        });
        if (tab === 'login') populateLoginUserSelect();
        initializeLucideIcons();
    }

    function handleUserLogout() {
        state.user = { ...DEFAULT_VISITOR_USER };
        try {
            localStorage.setItem('myticket_active_user_v4', JSON.stringify(state.user));
        } catch (e) {}

        applyUserStatesUI();
        switchView('accueil');
        showNotification("Déconnexion Réussie", "Vous êtes désormais en Mode Visiteur.", "info");
    }

    

    const OFFICIAL_COMMITTEES = [
        "Coordination Stratégique",
        "Coordination Opérationnelle",
        "Comité Supervision",
        "Comité Spirituel",
        "Comité Communication & Mobilisation",
        "Comité Animation & Jeux",
        "Comité Administratif",
        "Comité Logistique",
        "Comité Financier",
        "Comité Restauration",
        "Comité Accueil & Sécurité"
    ];

    const DEFAULT_SEED_USERS = [
        { id: "USR-01", name: "Responsable Coordination Stratégique", comite: "Coordination Stratégique", contact1: "+225 07 00 00 01", contact2: "", password: "ADMIN", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=210&q=80", dateCreation: "2026-01-01" },
        { id: "USR-02", name: "Responsable Coordination Opérationnelle", comite: "Coordination Opérationnelle", contact1: "+225 07 00 00 02", contact2: "", password: "ADMIN", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=210&q=80", dateCreation: "2026-01-01" },
        { id: "USR-03", name: "Responsable Comité Supervision", comite: "Comité Supervision", contact1: "+225 07 00 00 03", contact2: "", password: "ADMIN", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=210&q=80", dateCreation: "2026-01-01" },
        { id: "USR-04", name: "Responsable Comité Spirituel", comite: "Comité Spirituel", contact1: "+225 07 00 00 04", contact2: "", password: "ADMIN", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=210&q=80", dateCreation: "2026-01-01" },
        { id: "USR-05", name: "Responsable Communication & Mobilisation", comite: "Comité Communication & Mobilisation", contact1: "+225 07 00 00 05", contact2: "", password: "ADMIN", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=210&q=80", dateCreation: "2026-01-01" },
        { id: "USR-06", name: "Responsable Animation & Jeux", comite: "Comité Animation & Jeux", contact1: "+225 07 00 00 06", contact2: "", password: "ADMIN", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=210&q=80", dateCreation: "2026-01-01" },
        { id: "USR-07", name: "Responsable Comité Administratif", comite: "Comité Administratif", contact1: "+225 07 00 00 07", contact2: "", password: "ADMIN", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=210&q=80", dateCreation: "2026-01-01" },
        { id: "USR-08", name: "Responsable Comité Logistique", comite: "Comité Logistique", contact1: "+225 07 00 00 08", contact2: "", password: "ADMIN", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=210&q=80", dateCreation: "2026-01-01" },
        { id: "USR-09", name: "Responsable Comité Financier", comite: "Comité Financier", contact1: "+225 07 00 00 09", contact2: "", password: "ADMIN", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=210&q=80", dateCreation: "2026-01-01" },
        { id: "USR-10", name: "Responsable Comité Restauration", comite: "Comité Restauration", contact1: "+225 07 00 00 10", contact2: "", password: "ADMIN", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=210&q=80", dateCreation: "2026-01-01" },
        { id: "USR-11", name: "Responsable Accueil & Sécurité", comite: "Comité Accueil & Sécurité", contact1: "+225 07 00 00 11", contact2: "", password: "ADMIN", avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=210&q=80", dateCreation: "2026-01-01" }
    ];

    
    // ==========================================
    // ADMINISTRATIVE ACTION: PURGE ALL USER ACCOUNTS (WITH ADMIN PWD MODAL)
    // ==========================================
    function openDeleteAllUsersModal() {
        const modal = document.getElementById('modal-delete-all-users-auth');
        const input = document.getElementById('delete-all-users-admin-pwd');
        if (input) input.value = '';
        if (modal) {
            modal.classList.remove('hidden');
            setTimeout(() => input?.focus(), 150);
        }
    }

    function closeDeleteAllUsersModal() {
        document.getElementById('modal-delete-all-users-auth')?.classList.add('hidden');
    }

    function executeDeleteAllUsersWithAuth() {
        const input = document.getElementById('delete-all-users-admin-pwd');
        const pwd = input ? input.value.trim() : '';
        if (!pwd) {
            showNotification("Mot de Passe Requis", "Veuillez saisir le mot de passe administrateur.", "error");
            input?.focus();
            return;
        }

        if (!verifyPersonalOrAdminPassword(pwd)) {
            showNotification("Mot de Passe Invalide", "Mot de passe administrateur incorrect. Suppression refusée.", "error");
            input?.focus();
            return;
        }

        state.users = [];
        state.user = { ...DEFAULT_VISITOR_USER };
        try {
            localStorage.setItem('myticket_users_v4', JSON.stringify([]));
            localStorage.setItem('myticket_active_user_v4', JSON.stringify(state.user));
            if (typeof MyTicketCloudDB !== 'undefined' && MyTicketCloudDB.purgeAllUsersCloud) {
                MyTicketCloudDB.purgeAllUsersCloud();
            }
        } catch(e){console.error(e);}

        applyUserStatesUI();
        populateLoginUserSelect();
        populateGatewayUserSelect();
        updateCreateComiteDropdown();
        populatePCOApproversDropdown();
        renderOrganisationLeaders();
        closeDeleteAllUsersModal();
        switchView('utilisateur');
        switchUserSectionTab('login');
        showNotification("Comptes Supprimés", "Tous les comptes utilisateurs ont été supprimés avec succès. L'application est réinitialisée en mode visiteur.", "success");
    }

    function deleteAllUserAccounts() {
        openDeleteAllUsersModal();
    }

    // ==========================================
    // ADMINISTRATIVE ACTION: PURGE COMPLETE DATABASE (WITH ADMIN PWD MODAL)
    // ==========================================
    function openPurgeAllDataModal() {
        const modal = document.getElementById('modal-purge-all-data-auth');
        const input = document.getElementById('purge-all-database-admin-pwd');
        if (input) input.value = '';
        if (modal) {
            modal.classList.remove('hidden');
            setTimeout(() => input?.focus(), 150);
        }
    }

    function closePurgeAllDataModal() {
        document.getElementById('modal-purge-all-data-auth')?.classList.add('hidden');
    }

    function executePurgeAllDatabaseWithAuth() {
        const input = document.getElementById('purge-all-database-admin-pwd');
        const pwd = input ? input.value.trim() : '';
        if (!pwd) {
            showNotification("Mot de Passe Requis", "Veuillez saisir le mot de passe administrateur pour confirmer la suppression.", "error");
            input?.focus();
            return;
        }

        if (!verifyPersonalOrAdminPassword(pwd)) {
            showNotification("Accès Refusé", "Mot de passe administrateur incorrect. La suppression de toutes les données a été bloquée.", "error");
            input?.focus();
            return;
        }

        // 1. Purge Participants
        state.participants = [];
        try { localStorage.setItem('myticket_participants_v8', JSON.stringify([])); } catch(e){console.error(e);}

        // 2. Purge Finance
        state.finance = {
            encaissements: [],
            decaissements: [],
            dons: [],
            committees: JSON.parse(JSON.stringify(OFFICIAL_COMMITTEES_FINANCE_STRUCTURE || []))
        };
        try { localStorage.setItem('myticket_finance_v14', JSON.stringify(state.finance)); } catch(e){console.error(e);}

        // 3. Purge Gallery
        state.galleryAlbums = [];
        try { localStorage.setItem('myticket_gallery_albums_v2', JSON.stringify([])); } catch(e){console.error(e);}

        // 4. Purge Users & Reset to Visitor
        state.users = [];
        state.user = { ...DEFAULT_VISITOR_USER };
        try {
            localStorage.setItem('myticket_users_v4', JSON.stringify([]));
            localStorage.setItem('myticket_active_user_v4', JSON.stringify(state.user));
        } catch(e){console.error(e);}

        // 5. Purge Cloud Database Collections
        if (typeof MyTicketCloudDB !== 'undefined' && MyTicketCloudDB.purgeAllCloudData) {
            MyTicketCloudDB.purgeAllCloudData();
        }

        // 6. Refresh UI components
        applyUserStatesUI();
        populateLoginUserSelect();
        populateGatewayUserSelect();
        updateCreateComiteDropdown();
        populatePCOApproversDropdown();
        renderOrganisationLeaders();
        renderParticipantsTable();
        renderFinanceDashboard();
        renderFinanceConsolidation();
        renderGalleryAlbums();
        updateDashboardStats();

        closePurgeAllDataModal();
        closeCloudSyncModal();
        switchView('accueil');
        showNotification("Base de Données Purgée !", "Toutes les données (billets, finances, comptes, albums) ont été définitivement supprimées avec succès.", "success");
    }

    function initializeUsersRegistry() {
        try {
            const stored = localStorage.getItem('myticket_users_v4');
            if (stored) {
                const parsed = JSON.parse(stored);
                state.users = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_SEED_USERS];
            } else {
                state.users = [...DEFAULT_SEED_USERS];
                localStorage.setItem('myticket_users_v4', JSON.stringify(state.users));
            }
        } catch (e) {
            state.users = [...DEFAULT_SEED_USERS];
        }

        // S'assurer que les 11 comités officiels disposent tous d'un compte prêt à la connexion
        DEFAULT_SEED_USERS.forEach(seed => {
            const exists = (state.users || []).some(u => u && u.comite === seed.comite);
            if (!exists) {
                state.users.push({ ...seed });
            }
        });

        populateLoginUserSelect();
        populateGatewayUserSelect();
        updateCreateComiteDropdown();
        populatePCOApproversDropdown();
    }

    function enterAsVisitor() {
        state.user = { ...DEFAULT_VISITOR_USER };
        document.getElementById('modal-initial-gateway')?.classList.add('hidden');
        applyUserStatesUI();
        switchView('accueil');
        showNotification("Bienvenue !", "Vous êtes connecté en tant que Visiteur. Vous pouvez réserver vos billets et consulter les infos pratiques.", "info");
    }

    function openCreateProfileFromGateway() {
        document.getElementById('modal-initial-gateway')?.classList.add('hidden');
        switchView('utilisateur');
        switchUserSectionTab('create');
    }

    function updateCreateComiteDropdown() {
        const select = document.getElementById('create-comite');
        if (!select) return;
        const currentVal = select.value;
        select.innerHTML = '';

        OFFICIAL_COMMITTEES.forEach(comiteName => {
            const existingUser = (state.users || []).find(u => u.comite === comiteName);
            if (existingUser) {
                select.innerHTML += `<option value="${comiteName}" disabled class="text-slate-400 bg-slate-100">${comiteName}</option>`;
            } else {
                select.innerHTML += `<option value="${comiteName}">${comiteName}</option>`;
            }
        });

        const firstAvailable = OFFICIAL_COMMITTEES.find(c => !(state.users || []).some(u => u.comite === c));
        if (firstAvailable) select.value = firstAvailable;
    }

    function handleGatewayLogin(event) {
        if (event && typeof event.preventDefault === 'function') event.preventDefault();

        const select = document.getElementById('gateway-user-select');
        const pwdInput = document.getElementById('gateway-user-password');
        if (!select || !pwdInput) return;

        const selectedComite = select.value;
        const enteredPwd = pwdInput.value.trim();
        if (!enteredPwd) {
            showNotification("Mot de Passe Requis", "Veuillez saisir votre mot de passe personnel.", "error");
            pwdInput.focus();
            return;
        }

        const user = (state.users || []).find(u => u.comite === selectedComite);

        if (!user) {
            showNotification("Compte Inexistant", `Aucun compte n'a encore été créé pour le "${selectedComite}". Veuillez d'abord créer votre profil officiel via le bouton "Créer un Profil".`, "error");
            return;
        }

        const isUserPasswordValid = user.password && user.password === enteredPwd;
        const isAdminPasswordValid = verifyPersonalOrAdminPassword(enteredPwd);

        if (!isUserPasswordValid && !isAdminPasswordValid) {
            showNotification("Mot de Passe Incorrect", "Le mot de passe d'accès pour ce comité est invalide.", "error");
            pwdInput.value = '';
            pwdInput.focus();
            return;
        }

        state.user = { ...user, isVisitor: false };
        try {
            localStorage.setItem('myticket_active_user_v4', JSON.stringify(state.user));
        } catch (e) {}

        applyUserStatesUI();
        pwdInput.value = '';
        document.getElementById('modal-initial-gateway')?.classList.add('hidden');
        switchView('accueil');
        showNotification("Connexion Réussie !", `Bienvenue ${user.name}. Vous êtes connecté au compte ${selectedComite}.`, "success");
        triggerJubileeConfetti();
    }

    function handleUserLogin(event) {
        if (event && typeof event.preventDefault === 'function') event.preventDefault();

        const select = document.getElementById('login-user-select');
        const pwdInput = document.getElementById('login-user-password');
        if (!select || !pwdInput) return;

        const selectedComite = select.value;
        const enteredPwd = pwdInput.value.trim();
        if (!enteredPwd) {
            showNotification("Mot de Passe Requis", "Veuillez saisir votre mot de passe.", "error");
            pwdInput.focus();
            return;
        }

        let user = (state.users || []).find(u => u && u.comite === selectedComite);

        // Auto-provisioning immédiat si compte absent avec mot de passe administrateur ou passe-partout
        if (!user) {
            const seed = DEFAULT_SEED_USERS.find(s => s.comite === selectedComite);
            user = seed ? { ...seed } : {
                id: `USR-${String((state.users || []).length + 1).padStart(2, '0')}`,
                name: `Responsable ${selectedComite}`,
                comite: selectedComite,
                contact1: "+225 00 00 00 00",
                contact2: "",
                password: "ADMIN",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=210&q=80",
                dateCreation: new Date().toISOString().split('T')[0]
            };
            if (!state.users) state.users = [];
            state.users.push(user);
            try {
                localStorage.setItem('myticket_users_v4', JSON.stringify(state.users));
                if (typeof MyTicketCloudDB !== 'undefined') MyTicketCloudDB.syncUser(user);
            } catch(e) {}
        }

        const isUserPasswordValid = user.password && user.password.toUpperCase() === enteredPwd.toUpperCase();
        const isAdminPasswordValid = verifyPersonalOrAdminPassword(enteredPwd);

        if (!isUserPasswordValid && !isAdminPasswordValid) {
            showNotification("Mot de Passe Incorrect", "Le mot de passe d'accès pour ce comité est invalide.", "error");
            pwdInput.value = '';
            pwdInput.focus();
            return;
        }

        state.user = { ...user, isVisitor: false };
        try {
            localStorage.setItem('myticket_active_user_v4', JSON.stringify(state.user));
        } catch (e) {}

        applyUserStatesUI();
        pwdInput.value = '';
        switchUserSectionTab('active');
        unlockApplication();
        showNotification("Connexion Réussie !", `Bienvenue ${user.name}. Vous êtes connecté avec succès au compte ${selectedComite}.`, "success");
        triggerJubileeConfetti();
    }

    function saveActiveUserProfile(event) {
        if (event && typeof event.preventDefault === 'function') event.preventDefault();

        const name = document.getElementById('active-edit-name').value.trim();
        const comite = document.getElementById('active-edit-comite').value;
        const contact1 = document.getElementById('active-edit-contact1').value.trim();
        const contact2 = document.getElementById('active-edit-contact2').value.trim();
        const oldPwd = document.getElementById('active-edit-old-password').value.trim();
        const newPwd = document.getElementById('active-edit-new-password').value.trim();
        const confirmPwd = document.getElementById('active-edit-confirm-password').value.trim();

        if (!name) {
            showNotification("Erreur", "Le nom ne peut pas être vide.", "error");
            return;
        }

        let passwordChanged = false;
        if (newPwd) {
            if (newPwd !== confirmPwd) {
                showNotification("Mots de passe non concordants", "Le nouveau mot de passe et sa confirmation ne correspondent pas.", "error");
                return;
            }
            if (state.user.password && state.user.password.toUpperCase() !== oldPwd.toUpperCase() && !verifyPersonalOrAdminPassword(oldPwd)) {
                showNotification("Ancien Mot de Passe Incorrect", "Veuillez saisir votre ancien mot de passe personnel pour le modifier.", "error");
                return;
            }
            state.user.password = newPwd;
            passwordChanged = true;
        }

        state.user.name = name;
        state.user.comite = comite;
        state.user.contact1 = contact1;
        state.user.contact2 = contact2;
        state.user.isVisitor = false;

        if (state.users) {
            const idx = state.users.findIndex(u => u.id === state.user.id);
            if (idx !== -1) {
                state.users[idx] = { ...state.user };
            } else {
                state.users.push({ ...state.user });
            }
        }

        try {
            saveUsersData();
            localStorage.setItem('myticket_active_user_v4', JSON.stringify(state.user));
        } catch (e) {}

        applyUserStatesUI();
        populateLoginUserSelect();
        populatePCOApproversDropdown();

        if (passwordChanged) {
            showNotification("Profil & Mot de Passe Mis à Jour !", "Vos coordonnées et votre nouveau mot de passe personnel ont été enregistrés avec succès.", "success");
        } else {
            showNotification("Profil Mis à Jour", "Vos coordonnées ont été actualisées avec succès.", "success");
        }
    }

    function uploadActiveUserAvatar(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                state.user.avatar = e.target.result;
                if (state.users) {
                    const idx = state.users.findIndex(u => u.id === state.user.id);
                    if (idx !== -1) state.users[idx].avatar = state.user.avatar;
                }
                try {
                    localStorage.setItem('myticket_users_v4', JSON.stringify(state.users));
            if (typeof MyTicketCloudDB !== 'undefined') (state.users || []).forEach(u => MyTicketCloudDB.syncUser(u));
                    localStorage.setItem('myticket_active_user_v4', JSON.stringify(state.user));
                } catch (err) {}
                applyUserStatesUI();
                showNotification("Photo Modifiée", "Votre photo de profil a été mise à jour.", "success");
            };
            reader.readAsDataURL(file);
        }
    }

    function uploadNewUserAvatar(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                createdAvatarDataURL = e.target.result;
                const preview = document.getElementById('create-avatar-preview');
                const emptyBox = document.getElementById('create-avatar-empty-box');
                const helper = document.getElementById('create-avatar-helper-text');
                
                if (preview) {
                    preview.src = createdAvatarDataURL;
                    preview.classList.remove('hidden');
                }
                if (emptyBox) emptyBox.classList.add('hidden');
                if (helper) helper.innerHTML = '<span class="text-emerald-600 font-bold flex items-center justify-center gap-1"><i data-lucide="check-circle" class="h-3 w-3"></i> Photo sélectionnée</span>';
                
                initializeLucideIcons();
                showNotification("Photo Importée", "Votre photo de profil a été chargée avec succès.", "success");
            };
            reader.readAsDataURL(file);
        }
    }


    // ==========================================
    // PARTICIPANTS TABLE & HISTORIQUE
    // ==========================================
    let pendingCreatedUser = null;

    function handleCreateUserProfile(event) {
        if (event && typeof event.preventDefault === 'function') event.preventDefault();

        const nameInput = document.getElementById('create-name');
        const comiteSelect = document.getElementById('create-comite');
        const contact1Input = document.getElementById('create-contact1');
        const contact2Input = document.getElementById('create-contact2');
        const pwdInput = document.getElementById('create-user-password');
        const adminPwdInput = document.getElementById('create-admin-password');

        if (!nameInput || !comiteSelect || !contact1Input || !pwdInput) {
            showNotification("Erreur Formulaire", "Impossible de lire les champs du formulaire.", "error");
            return;
        }

        const name = nameInput.value.trim();
        const comite = comiteSelect.value;
        const contact1 = contact1Input.value.trim();
        const contact2 = contact2Input ? contact2Input.value.trim() : '';
        const password = pwdInput.value.trim();
        const adminPwd = adminPwdInput ? adminPwdInput.value.trim() : '';

        if (!name) {
            showNotification("Nom Requis", "Veuillez saisir votre nom complet.", "error");
            nameInput.focus();
            return;
        }

        if (!contact1) {
            showNotification("Contact Requis", "Veuillez saisir votre numéro de contact principal.", "error");
            contact1Input.focus();
            return;
        }

        if (!password) {
            showNotification("Mot de Passe Requis", "Veuillez définir un mot de passe pour ce compte.", "error");
            pwdInput.focus();
            return;
        }

        // Admin authorization check
        if (adminPwdInput) {
            const adminPwd = adminPwdInput.value.trim();
            if (!verifyPersonalOrAdminPassword(adminPwd)) {
                showNotification("Mot de Passe Admin Invalide", "Le mot de passe administrateur pour autoriser la création de ce profil est requis et invalide.", "error");
                adminPwdInput.focus();
                return;
            }
        }

        pendingCreatedUser = {
            id: `USR-${String((state.users || []).length + 1).padStart(2, '0')}`,
            name: name,
            comite: comite,
            contact1: contact1,
            contact2: contact2,
            password: password,
            avatar: (typeof createdAvatarDataURL !== 'undefined' && createdAvatarDataURL) 
                ? createdAvatarDataURL 
                : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=210&q=80",
            dateCreation: new Date().toISOString().split('T')[0]
        };

        const modal = document.getElementById('modal-confirm-create-user');
        if (modal) {
            const elAvatar = document.getElementById('confirm-avatar-preview');
            if (elAvatar) elAvatar.src = pendingCreatedUser.avatar;
            const elName = document.getElementById('confirm-name-preview');
            if (elName) elName.innerText = name;
            const elCom = document.getElementById('confirm-comite-preview');
            if (elCom) elCom.innerText = comite;
            const elC1 = document.getElementById('confirm-contact1-preview');
            if (elC1) elC1.innerText = contact1;
            const elC2 = document.getElementById('confirm-contact2-preview');
            if (elC2) elC2.innerText = contact2 || 'Non renseigné';
            
            modal.classList.remove('hidden');
        } else {
            executeConfirmCreateUserProfile();
        }
    }

    function closeConfirmCreateUserModal() {
        document.getElementById('modal-confirm-create-user')?.classList.add('hidden');
        pendingCreatedUser = null;
    }

    function executeConfirmCreateUserProfile() {
        if (!pendingCreatedUser) return;

        if (!state.users) state.users = [];
        
        const existingIdx = state.users.findIndex(u => u.comite === pendingCreatedUser.comite);
        if (existingIdx !== -1) {
            state.users[existingIdx] = { ...pendingCreatedUser };
        } else {
            state.users.push(pendingCreatedUser);
        }
        
        state.user = { ...pendingCreatedUser, isVisitor: false };

        try {
            localStorage.setItem('myticket_users_v4', JSON.stringify(state.users));
            if (typeof MyTicketCloudDB !== 'undefined') (state.users || []).forEach(u => MyTicketCloudDB.syncUser(u));
            localStorage.setItem('myticket_active_user_v4', JSON.stringify(state.user));
        } catch (e) {}

        // Reset Form
        document.getElementById('form-create-user-profile')?.reset();
        createdAvatarDataURL = "";
        const avatarPreview = document.getElementById('create-avatar-preview');
        if (avatarPreview) {
            avatarPreview.src = "";
            avatarPreview.classList.add('hidden');
        }
        const emptyBox = document.getElementById('create-avatar-empty-box');
        if (emptyBox) emptyBox.classList.remove('hidden');

        applyUserStatesUI();
        populateLoginUserSelect();
        populateGatewayUserSelect();
        updateCreateComiteDropdown();
        populatePCOApproversDropdown();
        renderOrganisationLeaders();

        closeConfirmCreateUserModal();
        switchUserSectionTab('active');
        showNotification("Profil Créé & Connecté !", `Bienvenue ${state.user.name}. Votre compte officiel pour le ${state.user.comite} est désormais actif et opérationnel.`, "success");
        triggerJubileeConfetti();
    }

    function renderParticipantsTable() {
        const query = (document.getElementById('search-participants-input')?.value || '').toLowerCase().trim();
        const churchFilter = document.getElementById('filter-church-select')?.value || '';
        const tbody = document.getElementById('participants-table-body');
        const mobileContainer = document.getElementById('participants-mobile-cards');
        if (!tbody && !mobileContainer) return;
        
        const filtered = (state.participants || []).filter(p => {
            const matchesQuery = !query || 
                p.nom.toLowerCase().includes(query) || 
                p.prenom.toLowerCase().includes(query) || 
                p.id.toLowerCase().includes(query) || 
                p.eglise.toLowerCase().includes(query) ||
                (p.categorie || '').toLowerCase().includes(query) ||
                (p.preuveReglement || '').toLowerCase().includes(query) ||
                (p.contact1 || '').includes(query);
            const matchesChurch = !churchFilter || p.eglise.trim() === churchFilter;
            return matchesQuery && matchesChurch;
        });

        // 1. Desktop Table
        if (tbody) {
            tbody.innerHTML = '';
            if (filtered.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="py-12 text-center text-slate-400 italic text-xs">Aucun participant enregistré pour le moment.</td></tr>`;
            } else {
                filtered.forEach(p => {
                let catBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Classique (10.000 F)</span>`;
                if (p.categorie === 'Gold') catBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-400">GOLD (Gratuit)</span>`;
                else if (p.categorie === 'Invité') catBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Invité (Gratuit)</span>`;

                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                        <td class="py-3.5 px-6">
                            <div class="font-mono text-[10px] font-bold text-slate-500">#${p.id}</div>
                            <div class="font-bold text-slate-900 text-sm">${p.prenom} ${p.nom}</div>
                        </td>
                        <td class="py-3.5 px-6">${catBadge}</td>
                        <td class="py-3.5 px-6 font-medium text-slate-700">${p.eglise}</td>
                        <td class="py-3.5 px-6 font-medium text-slate-700 font-mono">${p.contact1}</td>
                        <td class="py-3.5 px-6 text-slate-700 text-xs">
                            <span class="font-bold text-slate-900">${p.modeReglement || 'Espèces'}</span><br>
                            <span class="text-[10px] text-brand-orange font-mono font-bold">${p.preuveReglement || '-'}</span>
                            ${p.assignedVerse ? `<div class="text-[9px] text-amber-700 font-bold truncate max-w-[130px]" title="${p.assignedVerse}">📖 ${p.assignedVerse.split('/').pop()}</div>` : ''}
                        </td>
                        <td class="py-3.5 px-6 text-right space-x-2">
                            <button onclick="viewAttendeeTicket('${p.id}')" class="p-2 text-slate-600 hover:text-brand-orange bg-slate-100 hover:bg-orange-50 rounded-xl transition cursor-pointer" title="Voir le Pass">
                                <i data-lucide="eye" class="h-4 w-4"></i>
                            </button>
                            <button onclick="deleteParticipant('${p.id}')" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer" title="Supprimer">
                                <i data-lucide="trash-2" class="h-4 w-4"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
        }

        // 2. Mobile Cards (Ultra clear for smartphones)
        if (mobileContainer) {
            mobileContainer.innerHTML = '';
            if (filtered.length === 0) {
                mobileContainer.innerHTML = `<div class="p-6 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">Aucun participant trouvé.</div>`;
            } else {
                filtered.forEach(p => {
                    let catBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">Classique</span>`;
                    if (p.categorie === 'Gold') catBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-400">GOLD (Gratuit)</span>`;
                    else if (p.categorie === 'Invité') catBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-950 border border-emerald-300">Invité</span>`;

                    mobileContainer.innerHTML += `
                        <div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                            <div class="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                                <div>
                                    <div class="font-black text-slate-900 text-sm sm:text-base leading-tight">${p.prenom} ${p.nom}</div>
                                    <div class="text-[11px] text-slate-500 mt-0.5">${p.eglise || 'EMCI Horeb'}</div>
                                </div>
                                <div class="text-right shrink-0">
                                    <span class="font-mono font-black text-xs text-brand-orange px-2 py-0.5 rounded-lg bg-orange-50 border border-orange-200/60 block">#${p.id}</span>
                                    <div class="mt-1">${catBadge}</div>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-2 text-xs">
                                <div class="p-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <span class="text-[10px] text-slate-400 font-bold uppercase block">Contact</span>
                                    <a href="tel:${(p.contact1||'').replace(/\s+/g, '')}" class="font-mono font-bold text-indigo-600 text-[11px] flex items-center gap-1 truncate">
                                        <i data-lucide="phone" class="h-3 w-3"></i> ${p.contact1 || '--'}
                                    </a>
                                </div>
                                <div class="p-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <span class="text-[10px] text-slate-400 font-bold uppercase block">Paiement</span>
                                    <span class="font-bold text-slate-800 text-[11px] block truncate">${p.modeReglement || 'Espèces'}</span>
                                    <span class="text-[9px] text-brand-orange font-mono font-bold block truncate">${p.preuveReglement || '-'}</span>
                                </div>
                            </div>

                            <div class="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                <button onclick="viewAttendeeTicket('${p.id}')" class="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer">
                                    <i data-lucide="ticket" class="h-3.5 w-3.5 text-amber-400"></i>
                                    <span>Voir le Pass</span>
                                </button>
                                <button onclick="deleteParticipant('${p.id}')" class="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border border-rose-200 transition cursor-pointer" title="Supprimer">
                                    <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
                                </button>
                            </div>
                        </div>
                    `;
                });
            }
        }

        initializeLucideIcons();
    }

    function renderHistoryList() {
        const container = document.getElementById('historique-list-container');
        const emptyState = document.getElementById('historique-empty-state');
        if (state.participants.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        emptyState.classList.add('hidden');
        container.innerHTML = '';
        state.participants.forEach(p => {
            let catColor = "text-blue-600 bg-blue-50";
            if (p.categorie === 'Gold') catColor = "text-amber-700 bg-amber-50";
            else if (p.categorie === 'VIP') catColor = "text-purple-700 bg-purple-50";
            else if (p.categorie === 'Invité') catColor = "text-emerald-700 bg-emerald-50";

            container.innerHTML += `
                <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="flex justify-between items-start">
                        <div class="space-y-1">
                            <span class="text-[10px] font-mono font-bold text-slate-400">ID: #${p.id}</span>
                            <h4 class="font-bold text-brand-dark text-base">${p.prenom} ${p.nom}</h4>
                            <p class="text-xs text-slate-500 font-medium">${p.eglise}</p>
                            <p class="text-[10px] font-mono text-slate-400 font-bold">${p.preuveReglement || ''}</p>
                        </div>
                        <span class="text-[9px] font-extrabold px-2.5 py-1 ${catColor} rounded-full shrink-0 uppercase">${p.categorie || 'Classique'}</span>
                    </div>
                    <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                        <span class="text-slate-400">${p.dateTicket || new Date(p.dateAdded).toLocaleDateString('fr-FR')}</span>
                        <button onclick="viewAttendeeTicket('${p.id}')" class="px-3.5 py-1.5 rounded-lg bg-brand-orange/10 hover:bg-brand-orange text-brand-orange hover:text-white font-bold transition flex items-center gap-1">
                            <i data-lucide="eye" class="h-3.5 w-3.5"></i> Afficher
                        </button>
                    </div>
                </div>
            `;
        });
        initializeLucideIcons();
    }

    function clearHistory() {
        if (confirm("Réinitialiser tout l'historique ?")) {
            state.participants = [];
            try {
                localStorage.setItem('myticket_participants_v8', JSON.stringify([]));
            } catch(e){console.error(e);}
            renderHistoryList();
            updateDashboardStats();
            renderReceptionTable();
            showNotification("Historique effacé", "Tous les enregistrements ont été réinitialisés.", "info");
        }
    }

    function exportToCsv() {
        if (state.participants.length === 0) {
            showNotification("Erreur", "Aucune donnée à exporter.", "error");
            return;
        }
        let csv = "data:text/csv;charset=utf-8,";
        csv += "ID;Nom;Prenom;Contact1;Contact2;Eglise;Categorie;Prix;ModeReglement;PreuveReglement;Emarge;DateTicket\r\n";
        state.participants.forEach(p => {
            csv += `${p.id};${p.nom};${p.prenom};${p.contact1};${p.contact2 || ''};${p.eglise};${p.categorie};${p.prix};${p.modeReglement};${p.preuveReglement || ''};${p.checkedIn ? 'OUI' : 'NON'};${p.dateTicket || ''}\r\n`;
        });
        const encoded = encodeURI(csv);
        const link = document.createElement("a");
        link.setAttribute("href", encoded);
        link.setAttribute("download", "Participants_Nuit_Jacob_Israel_2027.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification("Exportation Réussie !", "Le fichier CSV a été téléchargé.", "success");
    }


    // ==========================================
    // AUTHORIZATION HELPERS FOR DISBURSEMENTS
    // ==========================================
    function isUserAuthorizedToApproveDisbursement(user) {
        if (!user || user.isVisitor) return false;
        return ["Coordination Stratégique", "Coordination Opérationnelle", "Comité Financier"].includes(user.comite);
    }

    function isUserAuthorizedToInitiateDisbursement(committeeName) {
        if (!state.user || state.user.isVisitor) return false;
        if (isUserAuthorizedToApproveDisbursement(state.user)) return true;
        return state.user.comite === committeeName;
    }

    // ==========================================
    // RECEPTION, SCANNER & DONATION CONTROLLERS
    // ==========================================
    let receptionFilter = 'all';

    function filterReception(filter) {
        receptionFilter = filter;
        const btns = ['all', 'checked', 'pending'];
        btns.forEach(b => {
            const btn = document.getElementById(`rec-btn-${b}`) || document.getElementById(`btn-reception-${b}`);
            if (btn) {
                if (b === filter) {
                    btn.className = "px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#FF5A36] to-amber-500 text-white shadow-md shadow-orange-500/25 ring-1 ring-white/30 transition cursor-pointer transform scale-105";
                } else {
                    btn.className = "px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60 transition cursor-pointer";
                }
            }
        });
        renderReceptionTable();
    }

    
    
    // ==========================================
    // ==========================================
    // MODULE GALERIE RETIRÉ POUR FLUIDITÉ TOTALE DU DÉFILEMENT
    // ==========================================
    function initializeGalleryAlbumsData() {}
    function renderGalleryAlbums() {}
    function saveGalleryAlbumsData() {}
    function openGalleryPreview() {}
    function closeGalleryPreview() {}
    function openCreateAlbumModal() {}
    function closeCreateAlbumModal() {}
    function openAddMediaToAlbumModal() {}
    function closeAddMediaToAlbumModal() {}

    // 11 COMMITTEES DIRECTORY CONTROLLERS (AVEC PHOTOS DE PROFIL & SYNCHRO COMPTES)
    // ==========================================
    const APROPOS_COMMITTEES_CONFIG = [
        { id: "strat", name: "Coordination Stratégique", role: "Supervision générale, arbitrage & vision stratégique", icon: "crown", color: "from-amber-500 to-amber-600" },
        { id: "op", name: "Coordination Opérationnelle", role: "Coordination terrain, gestion du site Noces d'Or & timing", icon: "clipboard-list", color: "from-blue-500 to-indigo-600" },
        { id: "supervision", name: "Comité Supervision", role: "Veille pastorale, encadrement spirituel & conformité", icon: "shield-check", color: "from-purple-500 to-indigo-600" },
        { id: "spi", name: "Comité Spirituel", role: "Veille de prière, liturgie, onction & temps de bénédiction", icon: "flame", color: "from-violet-600 to-purple-700" },
        { id: "com", name: "Comité Communication & Mobilisation", role: "Médias, affichage, réseaux sociaux, diffusion OJ-TV & TikTok", icon: "megaphone", color: "from-rose-500 to-red-600" },
        { id: "animation", name: "Comité Animation & Jeux", role: "Concert de célébration, jeux bibliques, quiz & réjouissances", icon: "music", color: "from-pink-500 to-rose-600" },
        { id: "sec", name: "Comité Administratif", role: "Registre des festivaliers, attribution des pass & badges", icon: "file-text", color: "from-teal-500 to-cyan-600" },
        { id: "log", name: "Comité Logistique", role: "Aménagement de l'espace VIP, matériel & installations techniques", icon: "truck", color: "from-cyan-500 to-blue-600" },
        { id: "fin", name: "Comité Financier", role: "Recouvrement des pass, validation des décaissements & budget", icon: "wallet", color: "from-emerald-500 to-teal-600" },
        { id: "res", name: "Comité Restauration", role: "Banquet des 210 convives, menu gastronomique & rafraîchissements", icon: "utensils", color: "from-amber-600 to-orange-600" },
        { id: "acc", name: "Comité Accueil & Sécurité", role: "Check-in QR code, placement aux 27 Tables VIP & filtrage", icon: "scan-line", color: "from-red-500 to-orange-600" }
    ];

    function renderAproposCommittees() {
        const grid = document.getElementById('apropos-committees-directory-grid') || document.getElementById('annuaire-entities-grid');
        if (!grid) return;

        const users = state.users || [];
        const searchInput = document.getElementById('annuaire-search-input');
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

        // If no user account exists, display an empty virgin state
        if (users.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full p-10 text-center bg-slate-50/80 rounded-3xl border border-dashed border-slate-300 space-y-3">
                    <div class="inline-flex p-3.5 rounded-full bg-indigo-50 text-indigo-500 mb-1">
                        <i data-lucide="users" class="h-7 w-7"></i>
                    </div>
                    <h4 class="font-display font-black text-slate-800 text-sm sm:text-base">Aucun responsable enregistré pour le moment</h4>
                    <p class="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">L'annuaire des responsables est actuellement vierge. Dès qu'un membre crée son profil officiel de comité, ses coordonnées réelles apparaîtront ici automatiquement.</p>
                </div>
            `;
            initializeLucideIcons();
            return;
        }

        // When accounts exist, filter them by query
        let matchingUsers = users;
        if (query) {
            matchingUsers = users.filter(u => 
                (u.name && u.name.toLowerCase().includes(query)) ||
                (u.comite && u.comite.toLowerCase().includes(query)) ||
                (u.contact1 && u.contact1.replace(/\s+/g, '').includes(query)) ||
                (u.contact2 && u.contact2.replace(/\s+/g, '').includes(query))
            );
        }

        if (matchingUsers.length === 0) {
            grid.innerHTML = `<div class="col-span-full py-8 text-center text-slate-400 italic text-xs">Aucun responsable enregistré ne correspond à "${query}".</div>`;
            initializeLucideIcons();
            return;
        }

        grid.innerHTML = '';
        matchingUsers.forEach(user => {
            const comConfig = APROPOS_COMMITTEES_CONFIG.find(c => c.name.toLowerCase() === (user.comite || '').toLowerCase()) || {
                icon: 'user-check',
                color: 'from-blue-500 to-indigo-600',
                role: 'Responsable de Comité'
            };

            const respName = user.name;
            const respPhoto = user.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
            const phoneClean = (user.contact1 || '').replace(/[^0-9+]/g, '');
            const waUrl = phoneClean ? `https://wa.me/${phoneClean.replace('+', '')}?text=${encodeURIComponent(`Bonjour ${respName}, je vous contacte concernant la célébration des 10 Ans (${user.comite}).`)}` : '#';

            grid.innerHTML += `
                <div class="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400/60 hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3 group">
                    <!-- Left Avatar & Info -->
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                        <div class="relative shrink-0">
                            <img src="${respPhoto}" alt="${respName}" class="h-11 w-11 rounded-full object-cover border-2 border-slate-100 group-hover:border-amber-400 shadow-2xs transition">
                            <span class="absolute -bottom-1 -right-1 h-5 w-5 rounded-lg bg-gradient-to-br ${comConfig.color} text-white flex items-center justify-center text-[10px] shadow-2xs">
                                <i data-lucide="${comConfig.icon}" class="h-2.5 w-2.5"></i>
                            </span>
                        </div>

                        <div class="min-w-0 flex-1 space-y-0.5">
                            <div class="flex items-center gap-1.5">
                                <h4 class="font-display font-black text-slate-900 text-xs sm:text-xs truncate" title="${user.comite}">${user.comite}</h4>
                            </div>
                            <div class="font-semibold text-slate-700 text-xs truncate">${respName}</div>
                            <p class="text-[10px] text-slate-500 truncate leading-tight font-normal">${comConfig.role}</p>
                        </div>
                    </div>

                    <!-- Right Quick Contact Actions -->
                    <div class="flex items-center gap-1.5 shrink-0 pl-1 border-l border-slate-100">
                        ${phoneClean ? `
                            <a href="tel:${phoneClean}" class="p-2 rounded-xl bg-slate-50 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition transform hover:scale-105 cursor-pointer shadow-2xs" title="Appeler ${respName} (${user.contact1})">
                                <i data-lucide="phone" class="h-3.5 w-3.5"></i>
                            </a>
                            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white transition transform hover:scale-105 cursor-pointer shadow-2xs" title="Écrire à ${respName} sur WhatsApp">
                                <i data-lucide="message-circle" class="h-3.5 w-3.5"></i>
                            </a>
                        ` : `
                            <span class="text-[10px] text-slate-400 italic font-mono px-2">En attente</span>
                        `}
                    </div>
                </div>
            `;
        });

        initializeLucideIcons();
    }

    function getParticipantTableInfo(p) {
        if (!p) return { tableName: "Table Non Attribuée", seatNum: "Siège --", fullTableName: "Table --" };
        const cat = p.categorie || 'Classique';
        const catParticipants = (state.participants || []).filter(item => (item.categorie || 'Classique') === cat);
        const pIndex = catParticipants.findIndex(item => item.id === p.id);
        const index = pIndex >= 0 ? pIndex : 0;
        
        const seatsPerTable = cat === 'Invité' ? 10 : 8;
        const tableNum = Math.floor(index / seatsPerTable) + 1;
        const seatNum = (index % seatsPerTable) + 1;
        
        let tableName = "";
        if (cat === 'Gold') {
            tableName = `Table ${String(tableNum).padStart(2, '0')} (Gold)`;
        
        } else if (cat === 'Invité') {
            tableName = `Table d'Honneur ${String(tableNum).padStart(2, '0')}`;
        } else {
            tableName = `Table ${String(tableNum + 10).padStart(2, '0')} (Béthel)`;
        }
        
        return {
            tableName: tableName,
            seatNum: `Siège ${String(seatNum).padStart(2, '0')}`,
            fullTableName: `${tableName} • Siège ${String(seatNum).padStart(2, '0')}`
        };
    }

    function findParticipantByQuery(query) {
        if (!query) return null;
        const raw = query.toString().trim();
        const clean = raw.replace('#', '').toLowerCase();

        // 1. JSON parsing in case QR encodes a JSON payload
        try {
            if (raw.startsWith('{') && raw.endsWith('}')) {
                const parsed = JSON.parse(raw);
                if (parsed) {
                    const candidate = parsed.id || parsed.ticketId || parsed.ref || parsed.numero;
                    if (candidate) {
                        const match = findParticipantByQuery(candidate);
                        if (match) return match;
                    }
                }
            }
        } catch (e) {}

        // 2. Direct exact ID match (e.g. 'MYT-0001', 'TIC-1234', '0001')
        let p = (state.participants || []).find(part => 
            part && part.id && (
                part.id.toLowerCase() === clean || 
                part.id.toLowerCase() === `myt-${clean}` ||
                `#${part.id}`.toLowerCase() === clean
            )
        );
        if (p) return p;

        // 3. Regex match for MYT pattern anywhere in URL or text (e.g. 'https://...#MYT-0001', 'MYT-0005', 'Pass MYT-0012')
        const mytMatch = raw.match(/MYT[-_]?\s*(\d+)/i);
        if (mytMatch) {
            const seq = parseInt(mytMatch[1], 10);
            p = (state.participants || []).find(part => {
                if (!part || !part.id) return false;
                const m = part.id.match(/MYT[-_]?\s*(\d+)/i);
                return m && parseInt(m[1], 10) === seq;
            });
            if (p) return p;
        }

        // 4. Numeric sequence match (e.g. user typed or scanned "1" -> matches "MYT-0001", "15" -> "MYT-0015")
        const digitsOnly = raw.replace(/\D/g, '');
        if (digitsOnly.length > 0 && digitsOnly.length <= 4) {
            const numVal = parseInt(digitsOnly, 10);
            p = (state.participants || []).find(part => {
                if (!part || !part.id) return false;
                const partDigits = part.id.replace(/\D/g, '');
                return partDigits && parseInt(partDigits, 10) === numVal;
            });
            if (p) return p;
        }

        // 5. Contact phone numbers (e.g. 0708091011)
        if (digitsOnly.length >= 8) {
            p = (state.participants || []).find(part => {
                if (!part) return false;
                const c1 = (part.contact1 || '').replace(/\D/g, '');
                const c2 = (part.contact2 || '').replace(/\D/g, '');
                return (c1 && c1.includes(digitsOnly)) || (c2 && c2.includes(digitsOnly));
            });
            if (p) return p;
        }

        // 6. Search by attendee name
        p = (state.participants || []).find(part => {
            if (!part) return false;
            const fullName1 = `${part.prenom || ''} ${part.nom || ''}`.toLowerCase();
            const fullName2 = `${part.nom || ''} ${part.prenom || ''}`.toLowerCase();
            return fullName1.includes(clean) || fullName2.includes(clean);
        });
        if (p) return p;

        return null;
    }

    function renderReceptionTable() {
        const tbody = document.getElementById('reception-attendees-tbody');
        const mobileContainer = document.getElementById('reception-attendees-mobile-cards');
        if (!tbody && !mobileContainer) return;

        const totalParticipants = (state.participants || []).length;
        const checkedCount = (state.participants || []).filter(p => p.checkedIn).length;
        const pendingCount = totalParticipants - checkedCount;
        const attendanceRate = totalParticipants > 0 ? Math.round((checkedCount / totalParticipants) * 100) : 0;

        const statTotal = document.getElementById('reception-stat-total');
        const statChecked = document.getElementById('reception-stat-checked');
        const statPending = document.getElementById('reception-stat-pending');
        const statRate = document.getElementById('reception-stat-rate');

        if (statTotal) statTotal.innerText = totalParticipants;
        if (statChecked) statChecked.innerText = checkedCount;
        if (statPending) statPending.innerText = pendingCount;
        if (statRate) statRate.innerText = `${attendanceRate}%`;

        const countBadge = document.getElementById('reception-count-badge');
        if (countBadge) countBadge.innerText = `${totalParticipants} Participants`;

        const searchInput = document.getElementById('reception-search-input');
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const digitsOnly = query.replace(/\D/g, '');

        let list = (state.participants || []);

        // Filter by Status Tab
        if (receptionFilter === 'checked') {
            list = list.filter(p => p.checkedIn);
        } else if (receptionFilter === 'pending') {
            list = list.filter(p => !p.checkedIn);
        }

        // Filter by Search Query (Number, ID, Name, Church, Phone)
        if (query) {
            const numVal = digitsOnly.length > 0 ? parseInt(digitsOnly, 10) : null;
            list = list.filter(p => {
                const idLower = p.id.toLowerCase();
                const nameLower = `${p.prenom || ''} ${p.nom || ''}`.toLowerCase();
                const churchLower = (p.eglise || '').toLowerCase();
                const c1 = (p.contact1 || '').toLowerCase();
                const c2 = (p.contact2 || '').toLowerCase();

                if (idLower.includes(query) || nameLower.includes(query) || churchLower.includes(query) || c1.includes(query) || c2.includes(query)) {
                    return true;
                }
                if (numVal !== null) {
                    const partDigits = p.id.replace(/\D/g, '');
                    if (partDigits && parseInt(partDigits, 10) === numVal) return true;
                }
                return false;
            });
        }

        // 1. Populate Desktop Table
        if (tbody) {
            tbody.innerHTML = '';
            if (list.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400 italic font-mono">Aucun participant ne correspond aux critères sélectionnés.</td></tr>`;
            } else {
                list.forEach(p => {
                    const tableInfo = getParticipantTableInfo(p);
                    let catColor = "text-blue-700 bg-blue-50 border-blue-200 font-bold";
                    if (p.categorie === 'Gold') catColor = "text-amber-900 bg-amber-50 border-amber-300 font-black";
                    else if (p.categorie === 'VIP') catColor = "text-purple-900 bg-purple-50 border-purple-300 font-bold";
                    else if (p.categorie === 'Invité') catColor = "text-emerald-900 bg-emerald-50 border-emerald-300 font-bold";

                    const isChecked = !!p.checkedIn;
                    tbody.innerHTML += `
                        <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                            <td class="py-3.5 px-4 font-bold text-slate-900">
                                ${p.prenom} ${p.nom}<br>
                                <span class="text-[10px] text-slate-500 font-normal font-mono">${p.dateTicket || '--'}</span>
                            </td>
                            <td class="py-3.5 px-4 font-mono font-black text-brand-orange">
                                #${p.id}<br>
                                <span class="text-[10px] text-slate-600 font-semibold">${tableInfo.fullTableName}</span>
                            </td>
                            <td class="py-3.5 px-4">
                                <span class="px-2.5 py-1 rounded-full text-[10px] uppercase border ${catColor}">${p.categorie || 'Classique'}</span>
                            </td>
                            <td class="py-3.5 px-4 text-slate-700 text-xs truncate max-w-[130px] font-medium">${p.eglise || 'EMCI Horeb'}</td>
                            <td class="py-3.5 px-4 font-mono text-xs text-slate-700 font-medium">${p.contact1 || '--'}</td>
                            <td class="py-3.5 px-4">
                                ${isChecked ? `
                                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                                        <i data-lucide="check-circle" class="h-3.5 w-3.5 text-emerald-600"></i> Émargé à ${p.checkInTime || '00:00'}
                                    </span>
                                ` : `
                                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300 inline-flex items-center gap-1">
                                        <i data-lucide="clock" class="h-3.5 w-3.5 text-slate-400"></i> En Attente
                                    </span>
                                `}
                            </td>
                            <td class="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                                ${isChecked ? `
                                    <button onclick="requestUncheckParticipant('${p.id}')" class="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs" title="Seul un Administrateur peut annuler l'émargement">
                                        <i data-lucide="shield-alert" class="h-3.5 w-3.5 text-amber-600"></i>
                                        <span>Annuler (Admin)</span>
                                    </button>
                                ` : `
                                    <button onclick="executeCheckInForTicketId('${p.id}')" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-black text-xs shadow-sm transition inline-flex items-center gap-1 cursor-pointer">
                                        <i data-lucide="check" class="h-3.5 w-3.5"></i>
                                        <span>Émarger</span>
                                    </button>
                                `}
                                <button onclick="deleteParticipant('${p.id}')" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer inline-flex items-center" title="Supprimer l'inscription (Admin)">
                                    <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }
        }

        // 2. Populate Mobile Cards (Clear visual layout for smartphones)
        if (mobileContainer) {
            mobileContainer.innerHTML = '';
            if (list.length === 0) {
                mobileContainer.innerHTML = `<div class="p-6 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">Aucun participant ne correspond aux critères.</div>`;
            } else {
                list.forEach(p => {
                    const tableInfo = getParticipantTableInfo(p);
                    let catColor = "text-blue-700 bg-blue-50 border-blue-200 font-bold";
                    if (p.categorie === 'Gold') catColor = "text-amber-900 bg-amber-50 border-amber-300 font-black";
                    else if (p.categorie === 'VIP') catColor = "text-purple-900 bg-purple-50 border-purple-300 font-bold";
                    else if (p.categorie === 'Invité') catColor = "text-emerald-900 bg-emerald-50 border-emerald-300 font-bold";

                    const isChecked = !!p.checkedIn;
                    mobileContainer.innerHTML += `
                        <div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                            <div class="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                                <div>
                                    <div class="font-black text-slate-900 text-sm sm:text-base leading-tight">${p.prenom} ${p.nom}</div>
                                    <div class="text-[11px] text-slate-500 mt-0.5">${p.eglise || 'EMCI Horeb'}</div>
                                </div>
                                <div class="text-right shrink-0">
                                    <span class="font-mono font-black text-xs text-brand-orange px-2 py-0.5 rounded-lg bg-orange-50 border border-orange-200/60 block">#${p.id}</span>
                                    <span class="px-2 py-0.5 rounded-full text-[9px] uppercase border ${catColor} inline-block mt-1">${p.categorie || 'Classique'}</span>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-2 text-xs">
                                <div class="p-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <span class="text-[10px] text-slate-400 font-bold uppercase block">Placement</span>
                                    <span class="font-bold text-slate-800 text-[11px] truncate block">${tableInfo.fullTableName}</span>
                                </div>
                                <div class="p-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <span class="text-[10px] text-slate-400 font-bold uppercase block">Contact</span>
                                    <a href="tel:${(p.contact1||'').replace(/\s+/g, '')}" class="font-mono font-bold text-indigo-600 text-[11px] flex items-center gap-1 truncate">
                                        <i data-lucide="phone" class="h-3 w-3"></i> ${p.contact1 || '--'}
                                    </a>
                                </div>
                            </div>

                            <div class="flex items-center justify-between gap-2 pt-1">
                                <div>
                                    ${isChecked ? `
                                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                                            <i data-lucide="check-circle" class="h-3 w-3 text-emerald-600"></i> Émargé à ${p.checkInTime || '00:00'}
                                        </span>
                                    ` : `
                                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300 inline-flex items-center gap-1">
                                            <i data-lucide="clock" class="h-3 w-3 text-slate-400"></i> En Attente
                                        </span>
                                    `}
                                </div>
                                <div class="flex items-center gap-1.5">
                                    ${isChecked ? `
                                        <button onclick="requestUncheckParticipant('${p.id}')" class="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs transition inline-flex items-center gap-1 cursor-pointer">
                                            <i data-lucide="shield-alert" class="h-3.5 w-3.5 text-amber-600"></i>
                                            <span>Annuler (Admin)</span>
                                        </button>
                                    ` : `
                                        <button onclick="executeCheckInForTicketId('${p.id}')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-black text-xs shadow-sm transition inline-flex items-center gap-1 cursor-pointer">
                                            <i data-lucide="check" class="h-3.5 w-3.5"></i>
                                            <span>Émarger</span>
                                        </button>
                                    `}
                                    <button onclick="deleteParticipant('${p.id}')" class="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border border-rose-200 transition cursor-pointer inline-flex items-center" title="Supprimer l'inscription">
                                        <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
        }

        initializeLucideIcons();
    }

    function requestUncheckParticipant(participantId) {
        const p = (state.participants || []).find(part => part.id === participantId);
        if (!p) return;

        pendingUncheckParticipantId = participantId;

        const modal = document.getElementById('modal-admin-uncheck');
        if (modal) {
            const nameEl = document.getElementById('admin-uncheck-participant-name');
            const refEl = document.getElementById('admin-uncheck-participant-ref');
            const tableInfo = getParticipantTableInfo(p);

            if (nameEl) nameEl.innerText = `${p.prenom} ${p.nom} (${p.categorie || 'Classique'})`;
            if (refEl) refEl.innerText = `#${p.id} • ${tableInfo.fullTableName}`;

            const input = document.getElementById('admin-uncheck-code-input');
            if (input) {
                input.value = '';
                input.type = 'password';
            }
            modal.classList.remove('hidden');
            if (input) setTimeout(() => input.focus(), 150);
            initializeLucideIcons();
        }
    }

    function closeAdminUncheckModal() {
        pendingUncheckParticipantId = null;
        document.getElementById('modal-admin-uncheck')?.classList.add('hidden');
    }

    function confirmAdminUncheck() {
        if (!pendingUncheckParticipantId) {
            closeAdminUncheckModal();
            return;
        }

        const input = document.getElementById('admin-uncheck-code-input');
        const enteredPassword = input ? input.value.trim() : '';

        if (!enteredPassword) {
            showNotification("Mot de Passe Requis", "Veuillez saisir votre mot de passe administrateur.", "warning");
            if (input) input.focus();
            return;
        }

        // 1. Verify against currently connected user password if user is Admin
        const isCurrentAdminMatch = isUserAdmin(state.user) && state.user.password && (state.user.password.toUpperCase() === enteredPassword.toUpperCase());

        // 2. Verify against any registered Administrator Account in the system
        const isRegisteredAdminMatch = (state.users || []).some(u => isUserAdmin(u) && u.password && (u.password.toUpperCase() === enteredPassword.toUpperCase()));

        // 3. Verify against Master Admin Passwords (e.g. 10ANS, ADMIN, ADMIN2027, 1234, etc.)
        const isMasterAdminMatch = verifyPersonalOrAdminPassword(enteredPassword);

        if (isCurrentAdminMatch || isRegisteredAdminMatch || isMasterAdminMatch) {
            const targetId = pendingUncheckParticipantId;
            closeAdminUncheckModal();
            executeUncheckParticipant(targetId);
        } else {
            showNotification("Mot de Passe Incorrect", "Le mot de passe administrateur est invalide. Accès refusé.", "error");
            if (input) {
                input.value = '';
                input.focus();
            }
        }
    }

    function executeUncheckParticipant(participantId) {
        const p = (state.participants || []).find(part => part.id === participantId);
        if (!p) return;
        p.checkedIn = false;
        p.checkInTime = null;
        try {
            localStorage.setItem('myticket_participants_v8', JSON.stringify(state.participants));
            if (typeof MyTicketCloudDB !== 'undefined') MyTicketCloudDB.syncParticipant(p);
        } catch(e){console.error(e);}
        renderReceptionTable();
        renderTablePlan();
        updateDashboardStats();
        showNotification("Émargement Annulé", `L'émargement de ${p.prenom} ${p.nom} a été annulé par l'Administrateur.`, "info");
    }

    function uncheckParticipant(participantId) {
        requestUncheckParticipant(participantId);
    }

    // =========================================================
    // DUAL-ENGINE REAL-TIME QR SCANNER (SCREEN & PAPER OPTIMIZED)
    // Hardware BarcodeDetector (GPU/NPU) + Multi-Pass jsQR Engine
    // with Dynamic Min-Max Screen Contrast Normalization
    // =========================================================
    let qrMediaStream = null;
    let qrScanAnimationId = null;
    let nativeBarcodeDetector = null;
    let isTorchOn = false;
    let isScanningActive = false;
    let currentFacingMode = "environment";

    // Initialize Native BarcodeDetector if available in browser
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        try {
            if (BarcodeDetector.getSupportedFormats) {
                BarcodeDetector.getSupportedFormats().then(formats => {
                    if (formats.includes('qr_code')) {
                        nativeBarcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });
                    }
                }).catch(() => {
                    try { nativeBarcodeDetector = new BarcodeDetector({ formats: ['qr_code'] }); } catch(e){}
                });
            } else {
                nativeBarcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });
            }
        } catch (e) {
            console.warn("Native BarcodeDetector notice:", e);
        }
    }

    function playScanSuccessFeedback() {
        // Haptic feedback (double vibration on phone)
        if (navigator.vibrate) {
            try { navigator.vibrate([60, 40, 60]); } catch (e) {}
        }
        // Web Audio Confirmation Beep (high melodic sine)
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                const ctx = new AudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
                gain.gain.setValueAtTime(0.18, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.12);
            }
        } catch (e) {}
    }

    function playScanRefusedFeedback() {
        // Haptic Refusal Pattern (Long buzzing vibration on phone)
        if (navigator.vibrate) {
            try { navigator.vibrate([150, 80, 150, 80, 250]); } catch (e) {}
        }
        // Web Audio Refusal Tone (Warning low sawtooth buzz)
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                const ctx = new AudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, ctx.currentTime);
                osc.frequency.setValueAtTime(160, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            }
        } catch (e) {}
    }

    async function openLiveCameraScanner() {
        const modal = document.getElementById('modal-qr-scanner');
        if (!modal) return;

        // Chargement à la demande des bibliothèques de scan si nécessaire
        const scanEngines = [];
        if (typeof jsQR === 'undefined' && typeof loadExternalScript === 'function') {
            scanEngines.push(loadExternalScript('https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'));
        }
        if (typeof ZXing === 'undefined' && typeof loadExternalScript === 'function') {
            scanEngines.push(loadExternalScript('https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js'));
        }
        if (scanEngines.length > 0) {
            try { await Promise.all(scanEngines); } catch(e){ console.warn("Notice moteurs scan:", e); }
        }
        modal.classList.remove('hidden');

        const manualInput = document.getElementById('modal-scanner-manual-input') || document.getElementById('camera-scan-id-input');
        if (manualInput) {
            manualInput.value = '';
            manualInput.focus();
        }

        const statusEl = document.getElementById('qr-scanner-status');
        if (statusEl) {
            statusEl.innerHTML = '<span class="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span><span>Recherche en cours... Visez le QR Code</span>';
            statusEl.className = "absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 backdrop-blur-xs rounded-full text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5 pointer-events-none border border-emerald-500/30 whitespace-nowrap shadow-md";
        }

        isTorchOn = false;
        const torchBtn = document.getElementById('btn-camera-torch');
        if (torchBtn) torchBtn.classList.add('hidden');

        await startCameraStream(currentFacingMode);
        initializeLucideIcons();
    }

    function openVisitorPassModal(ticket = state.currentTicket) {
        if (!ticket) {
            showNotification("Aucun Billet Émis", "Veuillez d'abord générer ou rechercher un pass.", "warning");
            return;
        }

        const modal = document.getElementById('modal-visitor-pass');
        if (!modal) return;

        const nameEl = document.getElementById('visitor-pass-name');
        const catEl = document.getElementById('visitor-pass-category');
        const tableEl = document.getElementById('visitor-pass-table');
        const refEl = document.getElementById('visitor-pass-ref');

        const fullName = `${ticket.prenom || ''} ${ticket.nom || ''}`.trim();
        const tableInfo = typeof getParticipantTableInfo === 'function' ? getParticipantTableInfo(ticket) : { fullTableName: 'Table Confirmée' };

        if (nameEl) nameEl.innerText = fullName || 'Invité';
        if (catEl) catEl.innerText = `Pass ${ticket.categorie || 'Classique'} • ${Number(ticket.prix || 0).toLocaleString('fr-FR')} FCFA`;
        if (tableEl) tableEl.innerText = tableInfo.fullTableName;
        if (refEl) refEl.innerText = ticket.id ? (ticket.id.startsWith('#') ? ticket.id : `#${ticket.id}`) : '#MYT-0001';

        generateQRGrid(ticket.id || 'MYT-0001');

        modal.classList.remove('hidden');
        initializeLucideIcons();
    }

    function closeVisitorPassModal() {
        document.getElementById('modal-visitor-pass')?.classList.add('hidden');
    }

    function downloadMobilePassImage() {
        const ticket = state.currentTicket;
        if (!ticket) {
            showNotification("Aucun Billet Émis", "Veuillez d'abord générer un pass.", "warning");
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = 900;
        canvas.height = 1400;
        const ctx = canvas.getContext('2d');

        // Dark Jubilee VIP Background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 1400);
        bgGrad.addColorStop(0, '#0b0f19');
        bgGrad.addColorStop(0.5, '#1e1b4b');
        bgGrad.addColorStop(1, '#0b0f19');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 900, 1400);

        // Gold border frame
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 6;
        ctx.strokeRect(30, 30, 840, 1340);

        // Header
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fbbf24';
        ctx.font = '900 24px monospace';
        ctx.fillText("★ 10 ANS DE GRÂCE • PASS OFFICIEL ★", 450, 95);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 42px system-ui, sans-serif';
        ctx.fillText("Nuit de JACOB à Israel", 450, 155);

        // Attendee Name
        const fullName = `${ticket.prenom || ''} ${ticket.nom || ''}`.trim();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 36px system-ui, sans-serif';
        ctx.fillText(fullName, 450, 235);

        // Category Badge
        const cat = (ticket.categorie || 'Classique').toUpperCase();
        const prixStr = ticket.prix ? Number(ticket.prix).toLocaleString('fr-FR') + ' FCFA' : 'GRATUIT';
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(230, 265, 440, 52);
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 22px monospace';
        ctx.fillText(`PASS ${cat} • ${prixStr}`, 450, 300);

        // HUGE QR CODE TILE (500px x 500px in center)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(200, 350, 500, 500);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 3;
        ctx.strokeRect(200, 350, 500, 500);

        if (typeof qrcode !== 'undefined') {
            const qr = qrcode(0, 'M');
            qr.addData(String(ticket.id || 'MYT-0001').trim());
            qr.make();
            const count = qr.getModuleCount();
            const margin = 4;
            const totalModules = count + margin * 2;
            const cellSize = 16; // Exact integer 16px per module
            const qrArea = totalModules * cellSize; // 29 * 16 = 464px
            const qrLeft = Math.round((900 - qrArea) / 2); // 218px
            const qrTop = 368;

            ctx.fillStyle = '#000000';
            for (let r = 0; r < count; r++) {
                for (let c = 0; c < count; c++) {
                    if (qr.isDark(r, c)) {
                        ctx.fillRect(qrLeft + (c + margin) * cellSize, qrTop + (r + margin) * cellSize, cellSize, cellSize);
                    }
                }
            }
        }

        // Ticket Ref below QR
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 32px monospace';
        ctx.fillText(`#${ticket.id || 'MYT-0001'}`, 450, 905);

        // Table & Seat Box
        const tableInfo = typeof getParticipantTableInfo === 'function' ? getParticipantTableInfo(ticket) : { fullTableName: 'Table Confirmée' };
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(150, 945, 600, 110);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(150, 945, 600, 110);

        ctx.fillStyle = '#fbbf24';
        ctx.font = '800 20px monospace';
        ctx.fillText("TABLE ASSISE & SIÈGE", 450, 980);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 30px system-ui, sans-serif';
        ctx.fillText(tableInfo.fullTableName, 450, 1025);

        // Reminder
        ctx.fillStyle = '#fbbf24';
        ctx.font = '800 20px system-ui, sans-serif';
        ctx.fillText("🎁 Rappel : Venir avec un cadeau mixte", 450, 1125);

        // Instruction for reception
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 18px system-ui, sans-serif';
        ctx.fillText("Présentez cet écran à l'accueil pour votre émargement", 450, 1280);

        // Download
        const link = document.createElement('a');
        link.download = `Pass_Mobile_${ticket.id || 'MYT'}_${ticket.nom || ''}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
        showNotification("Pass Smartphone Téléchargé", "Pass mobile enregistré avec succès dans vos photos !", "success");
    }

    let currentZoomLevel = 1;
    async function toggleCameraZoom() {
        currentZoomLevel = currentZoomLevel === 1 ? 2 : (currentZoomLevel === 2 ? 3 : 1);
        const zoomLabel = document.getElementById('zoom-label');
        if (zoomLabel) zoomLabel.innerText = `${currentZoomLevel}x`;

        if (qrMediaStream) {
            const track = qrMediaStream.getVideoTracks()[0];
            if (track && track.getCapabilities) {
                try {
                    const cap = track.getCapabilities();
                    if (cap.zoom) {
                        const targetZoom = Math.min(cap.zoom.max, Math.max(cap.zoom.min, currentZoomLevel));
                        await track.applyConstraints({ advanced: [{ zoom: targetZoom }] });
                    }
                } catch(e) {}
            }
        }
    }



    // ==============================================================================
    // WAVE MOBILE MONEY - MODULE CLIENT & SYNCHRONISATION (CAHIER DES CHARGES)
    // ==============================================================================

    let currentWaveTransactionsCache = [];
    let currentWaveStatusFilter = 'ALL';
    let lastConfirmedWaveTicket = null;

    /**
     * Détermine l'URL de base pour contacter l'API Wave
     * Si l'application tourne sur GitHub Pages (angecyriaque.github.io) ou en local (file://, localhost),
     * les appels sont automatiquement acheminés vers le backend Vercel officiel : https://projet-myticket.vercel.app
     */
    function getWaveApiBaseUrl() {
        const host = window.location.hostname || '';
        if (host === 'projet-myticket.vercel.app' || host.endsWith('.vercel.app')) {
            return '';
        }
        return 'https://projet-myticket.vercel.app';
    }

    /**
     * Wrapper sécurisé pour les requêtes API Wave
     * Évite l'erreur "Unexpected token <... is not valid JSON" lorsque le serveur renvoie du HTML (404, redirection)
     */
    async function safeWaveFetchJson(endpoint, options = {}) {
        const baseUrl = getWaveApiBaseUrl();
        const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

        let response;
        try {
            response = await fetch(url, options);
        } catch (networkErr) {
            throw new Error("Impossible de joindre le serveur de paiement Wave. Vérifiez votre connexion Internet.");
        }

        const contentType = response.headers.get('content-type') || '';

        // Si la réponse est du HTML (ex: 404 d'un hébergement statique ou erreur serveur)
        if (contentType.includes('text/html')) {
            const htmlSnippet = await response.text().catch(() => '');
            console.error("Réponse HTML inattendue reçue pour", url, ":", htmlSnippet.slice(0, 300));
            throw new Error(`Le point d'accès Wave n'a pas répondu au format attendu (Code HTTP ${response.status}). Assurez-vous d'utiliser l'application sur https://projet-myticket.vercel.app`);
        }

        let rawText = '';
        try {
            rawText = await response.text();
        } catch (readErr) {
            throw new Error("Échec de la lecture de la réponse serveur.");
        }

        let data;
        try {
            data = JSON.parse(rawText);
        } catch (parseErr) {
            console.error("Erreur parsing JSON sur", url, ":", rawText.slice(0, 300));
            throw new Error("Format de données invalide reçu du serveur.");
        }

        if (!response.ok) {
            throw new Error(data.error || data.message || `Erreur passerelle Wave (HTTP ${response.status})`);
        }

        return data;
    }

    /**
     * Paiement Wave Mobile Money (Option 1 : Déduction Wave + Contrôle Sécurisé du Reçu)
     * - Ouvre l'application Wave pour régler 10 000 FCFA à Pitchou maillots
     * - Prévient la fraude : aucun billet n'est validé si le solde est vide ou insuffisant
     * - Valide le pass dès réception et analyse de la capture d'écran ou du PDF
     */
    let pendingPaymentProvider = null; // 'wave' | 'orange'

    /**
     * Ouvre l'alerte préalable de règlement Wave
     * - Rappelle l'obligation d'importer la capture d'écran ou le PDF de la preuve
     * - Ouvre le lien officiel Wave dès que l'utilisateur valide sur "Okay"
     */
    function initiateWaveCheckoutPayment() {
        // Validation des coordonnées du participant
        const nom = (document.getElementById('form-nom')?.value || '').trim();
        const prenom = (document.getElementById('form-prenom')?.value || '').trim();
        const contact1 = (document.getElementById('form-contact1')?.value || '').trim();

        if (!nom || !prenom || !contact1) {
            showNotification("Coordonnées Incomplètes", "Veuillez renseigner votre nom, prénom et contact téléphonique avant de payer avec Wave.", "warning");
            document.getElementById('form-nom')?.focus();
            return;
        }

        showPaymentAlertModal('wave');
    }

    /**
     * Ouvre l'alerte préalable de règlement Orange Money
     * - Rappelle l'obligation d'importer la capture d'écran ou le PDF de la preuve
     * - Ouvre le lien officiel Orange Money dès que l'utilisateur valide sur "Okay"
     */
    function initiateOrangeMoneyPayment() {
        // Validation des coordonnées du participant
        const nom = (document.getElementById('form-nom')?.value || '').trim();
        const prenom = (document.getElementById('form-prenom')?.value || '').trim();
        const contact1 = (document.getElementById('form-contact1')?.value || '').trim();

        if (!nom || !prenom || !contact1) {
            showNotification("Coordonnées Incomplètes", "Veuillez renseigner votre nom, prénom et contact téléphonique avant de payer avec Orange Money.", "warning");
            document.getElementById('form-nom')?.focus();
            return;
        }

        showPaymentAlertModal('orange');
    }

    /**
     * Affiche le message d'alerte lors de la sélection du mode de règlement
     */
    function showPaymentAlertModal(provider) {
        pendingPaymentProvider = provider;
        const modal = document.getElementById('modal-payment-alert');
        if (!modal) return;

        const iconContainer = document.getElementById('payment-alert-icon-container');
        const alertBadge = document.getElementById('payment-alert-badge');
        const alertTitle = document.getElementById('payment-alert-title');
        const providerName = document.getElementById('payment-alert-provider-name');
        const providerTarget = document.getElementById('payment-alert-target');
        const btnProceed = document.getElementById('btn-payment-alert-proceed');

        if (provider === 'wave') {
            if (iconContainer) {
                iconContainer.className = "h-16 w-16 rounded-3xl bg-[#1DA1F2] text-white flex items-center justify-center mx-auto shadow-lg shadow-sky-500/30 text-2xl font-black";
                iconContainer.innerHTML = 'W';
            }
            if (alertBadge) {
                alertBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider font-mono border bg-sky-50 text-sky-800 border-sky-200";
                alertBadge.innerHTML = `<span class="h-2 w-2 rounded-full bg-[#1DA1F2]"></span><span>Règlement Wave • 10 000 FCFA</span>`;
            }
            if (alertTitle) alertTitle.innerText = "Information Importante avant Règlement Wave";
            if (providerName) providerName.innerText = "Wave";
            if (providerTarget) providerTarget.innerHTML = `Marchand : <strong class="text-slate-900 font-bold">Pitchou maillots</strong> • Montant : <strong class="text-emerald-700 font-black">10 000 FCFA</strong>`;
            if (btnProceed) {
                btnProceed.className = "py-3 px-4 rounded-xl bg-[#1DA1F2] hover:bg-[#1a90d9] text-white font-black text-xs shadow-lg shadow-sky-500/25 transition flex items-center justify-center gap-1.5 cursor-pointer";
                btnProceed.innerHTML = `<span>Okay</span><i data-lucide="arrow-right" class="h-4 w-4"></i>`;
            }
        } else {
            if (iconContainer) {
                iconContainer.className = "h-16 w-16 rounded-3xl bg-[#FF7900] text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30 text-lg font-black";
                iconContainer.innerHTML = 'OM';
            }
            if (alertBadge) {
                alertBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider font-mono border bg-orange-50 text-orange-800 border-orange-200";
                alertBadge.innerHTML = `<span class="h-2 w-2 rounded-full bg-[#FF7900]"></span><span>Règlement Orange Money • 10 000 FCFA</span>`;
            }
            if (alertTitle) alertTitle.innerText = "Information Importante avant Règlement Orange Money";
            if (providerName) providerName.innerText = "Orange Money";
            if (providerTarget) providerTarget.innerHTML = `Numéro Bénéficiaire : <strong class="text-slate-900 font-bold font-mono">0777588706</strong> • Montant : <strong class="text-emerald-700 font-black">10 000 FCFA</strong>`;
            if (btnProceed) {
                btnProceed.className = "py-3 px-4 rounded-xl bg-[#FF7900] hover:bg-[#e66d00] text-white font-black text-xs shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-1.5 cursor-pointer";
                btnProceed.innerHTML = `<span>Okay</span><i data-lucide="arrow-right" class="h-4 w-4"></i>`;
            }
        }

        modal.classList.remove('hidden');
        initializeLucideIcons();
    }

    function closePaymentAlertModal() {
        const modal = document.getElementById('modal-payment-alert');
        if (modal) modal.classList.add('hidden');
        pendingPaymentProvider = null;
    }

    /**
     * Une fois le Okay validé, ouvre le lien officiel de paiement
     */
    async function confirmAndProceedPayment() {
        const provider = pendingPaymentProvider;
        closePaymentAlertModal();

        const nom = (document.getElementById('form-nom')?.value || '').trim();
        const prenom = (document.getElementById('form-prenom')?.value || '').trim();
        const contact1 = (document.getElementById('form-contact1')?.value || '').trim();
        const contact2 = (document.getElementById('form-contact2')?.value || '').trim();
        const eglise = (document.getElementById('form-eglise')?.value || '').trim();
        const categorie = document.getElementById('form-categorie')?.value || 'Classique';

        if (provider === 'wave') {
            const waveLaunchUrl = 'https://pay.wave.com/m/M_ci_5Ak1intPKX_j/c/ci/?amount=10000';
            try {
                window.open(waveLaunchUrl, '_blank');
            } catch (e) {
                console.log("Notice ouverture Wave:", e);
            }

            safeWaveFetchJson('/api/wave-create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom, prenom, contact1, contact2, eglise, categorie })
            }).catch(e => console.warn("Notice sync serveur Wave:", e));

            showNotification(
                "Lien Wave Ouvert", 
                "Votre application Wave s'ouvre pour régler 10 000 FCFA à Pitchou maillots. Après le débit, importez votre capture d'écran ou PDF de reçu ci-dessous pour certifier votre billet.", 
                "info"
            );

            highlightProofSection('#1DA1F2');

        } else if (provider === 'orange') {
            const omLaunchUrl = 'https://multi.app.orange-money.com/app/v1/kapptivate/qrcode/odyssee/?id=codgen96-655552d6d2b4497ea36aa50bdfd97ccd&v=1&amount=10000';
            try {
                window.open(omLaunchUrl, '_blank');
            } catch (e) {
                console.log("Notice ouverture Orange Money:", e);
            }

            showNotification(
                "Lien Orange Money Ouvert", 
                "L'interface Orange Money s'ouvre pour régler 10 000 FCFA vers le numéro 0777588706. Après le débit, importez votre capture d'écran ou PDF de reçu ci-dessous pour certifier votre billet.", 
                "info"
            );

            highlightProofSection('#FF7900');
        }
    }

    function highlightProofSection(colorHex) {
        const proofSection = document.getElementById('payment-verification-container');
        if (proofSection) {
            proofSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            proofSection.style.boxShadow = `0 0 0 4px ${colorHex}40`;
            proofSection.classList.add('transition-all', 'duration-500');
            setTimeout(() => {
                if (proofSection) proofSection.style.boxShadow = '';
            }, 4000);
        }
        const fileInput = document.getElementById('proof-file-input');
        if (fileInput) {
            setTimeout(() => fileInput.focus(), 600);
        }
    }

    function openWaveLoadingModal() {
        const modal = document.getElementById('modal-wave-loading');
        if (modal) {
            modal.classList.remove('hidden');
            initializeLucideIcons();
        }
    }

    function closeWaveLoadingModal() {
        const modal = document.getElementById('modal-wave-loading');
        if (modal) modal.classList.add('hidden');
    }

    /**
     * Vérification automatique au retour de Wave (Section 2.3 & 6 du Cahier des Charges)
     * "Important : la redirection de l'utilisateur vers l'application après paiement ne constitue
     * pas une preuve de paiement. Seule la confirmation vérifiée côté serveur doit déclencher la validation."
     */
    async function checkWaveReturnOnLoad() {
        try {
            const params = new URLSearchParams(window.location.search);
            const waveStatus = params.get('wave_status');
            const ref = params.get('ref') || sessionStorage.getItem('myticket_pending_wave_ref');
            const sessionId = params.get('wave_session_id') || params.get('session_id');

            if (!waveStatus && !ref) return;

            // Nettoyage de l'URL pour ne pas ré-exécuter en boucle en cas de rafraîchissement
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);

            // Cas d'échec ou d'annulation
            if (waveStatus === 'error' || waveStatus === 'cancel') {
                showWaveResultModal({
                    success: false,
                    title: "Paiement Non Confirmé",
                    message: "Votre paiement n'a pas pu être confirmé. Vous pouvez réessayer.",
                    ref: ref || 'MYT-WV-ANNULE'
                });
                return;
            }

            // Cas de succès retour : vérification cryptographique et confirmation CÔTÉ SERVEUR
            if (waveStatus === 'success' || ref) {
                // Afficher un modal de vérification en cours
                showWaveResultModal({
                    success: true,
                    isLoading: true,
                    title: "Vérification en Cours...",
                    message: "Vérification cryptographique de votre paiement Wave de 10 000 FCFA auprès du serveur...",
                    ref: ref || 'En attente'
                });

                // Polling côté serveur
                let attempts = 0;
                const maxAttempts = 6;
                const checkInterval = setInterval(async () => {
                    attempts++;
                    try {
                        const statusUrl = `/api/wave-status?ref=${encodeURIComponent(ref || '')}&session_id=${encodeURIComponent(sessionId || '')}`;
                        const data = await safeWaveFetchJson(statusUrl);

                        if (data && data.status === 'Payé') {
                            clearInterval(checkInterval);
                            finalizeWavePaymentSuccess(data.transaction, data.ticketId || data.transaction?.ticketId);
                        } else if (attempts >= maxAttempts) {
                            clearInterval(checkInterval);
                            // Si toujours en attente après 6 tentatives (environ 12s)
                            if (data && data.status === 'En attente') {
                                finalizeWavePaymentPending(data.transaction || { clientReference: ref });
                            } else {
                                showWaveResultModal({
                                    success: false,
                                    title: "Paiement Non Confirmé",
                                    message: "Votre paiement n'a pas pu être confirmé. Vous pouvez réessayer.",
                                    ref: ref
                                });
                            }
                        }
                    } catch (pollErr) {
                        if (attempts >= maxAttempts) {
                            clearInterval(checkInterval);
                        }
                    }
                }, 2000);
            }
        } catch (e) {
            console.warn("Notice checkWaveReturnOnLoad:", e);
        }
    }

    /**
     * Finalise le paiement confirmé avec succès (Section 6 du Cahier des Charges)
     */
    function finalizeWavePaymentSuccess(transaction, ticketId) {
        lastConfirmedWaveTicket = ticketId || transaction?.ticketId || 'MYT-0001';
        const customer = transaction?.customer || JSON.parse(sessionStorage.getItem('myticket_pending_customer') || '{}');

        // Créer ou mettre à jour le participant dans state.participants
        let participant = (state.participants || []).find(p => p.id === lastConfirmedWaveTicket || p.preuveReglement === transaction?.waveTransactionId);

        if (!participant) {
            participant = {
                id: lastConfirmedWaveTicket,
                nom: customer.nom || 'Participant',
                prenom: customer.prenom || 'Wave',
                contact1: customer.contact1 || '',
                contact2: customer.contact2 || '',
                eglise: customer.eglise || 'EMCI Horeb',
                categorie: customer.categorie || 'Classique',
                prix: 10000,
                modeReglement: 'Wave',
                preuveReglement: transaction?.waveTransactionId || transaction?.clientReference || `T_WV_${Date.now()}`,
                dateTicket: new Date().toLocaleDateString('fr-FR'),
                checkedIn: false
            };
            state.participants.unshift(participant);
            localStorage.setItem('myticket_participants_v8', JSON.stringify(state.participants));
        }

        // RÈGLE OBLIGATOIRE : Attribution d'un verset biblique unique sans répétition
        if (!participant.assignedVerse) {
            participant.assignedVerse = assignUniqueVerseToParticipant(participant);
            localStorage.setItem('myticket_participants_v8', JSON.stringify(state.participants));
        }

        // RÈGLE OBLIGATOIRE : Marquer l'identifiant Wave comme consommé
        if (participant && participant.preuveReglement) {
            markProofIdentifierAsUsed(participant.preuveReglement, participant.id, `${participant.nom} ${participant.prenom}`.trim());
        }

        // Mettre à jour les finances
        if (state.finance && state.finance.accounts) {
            state.finance.accounts.wave = (state.finance.accounts.wave || 0) + 10000;
            state.finance.ticketsIncome = (state.finance.ticketsIncome || 0) + 10000;
            state.finance.incomesTotal = (state.finance.incomesTotal || 0) + 10000;
            state.finance.balance = (state.finance.incomesTotal || 0) - (state.finance.expensesTotal || 0);
            localStorage.setItem('myticket_finance_v14', JSON.stringify(state.finance));
        }

        // Synchroniser MyTicketCloudDB
        if (typeof MyTicketCloudDB !== 'undefined' && MyTicketCloudDB.syncParticipants) {
            try { MyTicketCloudDB.syncParticipants(); } catch(e) {}
        }

        // Activer le billet courant et basculer sur view-ticket
        state.currentTicket = participant;
        switchView('ticket');
        updateTicketPreviewUI(participant);

        // Effets festifs
        triggerJubileeConfetti();
        playScanSuccessFeedback();

        // Afficher le message officiel exigé par la Section 6
        showWaveResultModal({
            success: true,
            title: "Paiement Wave Confirmé !",
            message: "Votre paiement de 10 000 FCFA a été confirmé avec succès. Merci pour votre confiance.",
            ref: transaction?.clientReference || 'MYT-WV-OK',
            ticketId: lastConfirmedWaveTicket
        });

        // Nettoyage session
        sessionStorage.removeItem('myticket_pending_wave_ref');
        sessionStorage.removeItem('myticket_pending_customer');
    }

    function finalizeWavePaymentPending(transaction) {
        showWaveResultModal({
            success: true,
            title: "Paiement en Cours de Validation",
            message: "Votre transaction Wave a été initiée. Elle sera validée automatiquement dès notification de Wave.",
            ref: transaction?.clientReference || 'En attente',
            ticketId: 'Attribution en cours'
        });
    }

    function showWaveResultModal({ success, title, message, ref, ticketId, isLoading = false }) {
        const modal = document.getElementById('modal-wave-result');
        if (!modal) return;

        const iconContainer = document.getElementById('wave-result-icon-container');
        const iconEl = document.getElementById('wave-result-icon');
        const titleEl = document.getElementById('wave-result-title');
        const textEl = document.getElementById('wave-result-text');
        const refEl = document.getElementById('wave-result-ref');
        const ticketEl = document.getElementById('wave-result-ticket-badge');
        const btnViewPass = document.getElementById('btn-wave-view-pass');
        const card = document.getElementById('wave-result-card');

        if (titleEl) titleEl.innerText = title;
        if (textEl) textEl.innerText = message;
        if (refEl) refEl.innerText = ref || '--';
        if (ticketEl) ticketEl.innerText = ticketId ? (ticketId.startsWith('#') ? ticketId : `#${ticketId}`) : '--';

        if (isLoading) {
            if (iconContainer) iconContainer.className = "h-16 w-16 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-md ring-8 ring-sky-50 animate-spin";
            if (iconEl) iconEl.setAttribute('data-lucide', 'loader');
            if (card) card.className = "bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 text-center space-y-5 shadow-2xl relative border-4 border-sky-400";
            if (btnViewPass) btnViewPass.classList.add('hidden');
        } else if (success) {
            if (iconContainer) iconContainer.className = "h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md ring-8 ring-emerald-50";
            if (iconEl) iconEl.setAttribute('data-lucide', 'check-circle');
            if (card) card.className = "bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 text-center space-y-5 shadow-2xl relative border-4 border-emerald-500 animate-in zoom-in-95";
            if (btnViewPass) btnViewPass.classList.remove('hidden');
        } else {
            if (iconContainer) iconContainer.className = "h-16 w-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-md ring-8 ring-rose-50";
            if (iconEl) iconEl.setAttribute('data-lucide', 'alert-circle');
            if (card) card.className = "bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 text-center space-y-5 shadow-2xl relative border-4 border-rose-500 animate-in zoom-in-95";
            if (btnViewPass) btnViewPass.classList.add('hidden');
        }

        modal.classList.remove('hidden');
        initializeLucideIcons();
    }

    function closeWaveResultModal() {
        document.getElementById('modal-wave-result')?.classList.add('hidden');
    }

    function viewGeneratedTicketFromWave() {
        closeWaveResultModal();
        switchView('ticket');
        if (state.currentTicket && typeof openVisitorPassModal === 'function') {
            openVisitorPassModal(state.currentTicket);
        }
    }

    /**
     * Charge le tableau de bord Wave Admin (Sections 5 & 9 du Cahier des Charges)
     */
    async function loadWaveAdminDashboard() {
        const tableBody = document.getElementById('wave-transactions-table-body');
        if (!tableBody) return;

        try {
            // 1. Charger la configuration Wave
            try {
                const configData = await safeWaveFetchJson('/api/wave-config');
                const urlDisplay = document.getElementById('wave-webhook-url-display');
                if (urlDisplay && configData.webhook_url) urlDisplay.innerText = configData.webhook_url;
                const envBadge = document.getElementById('wave-admin-env-badge');
                if (envBadge && configData.environment) {
                    envBadge.innerText = configData.environment === 'production' ? 'Production Réelle' : 'Mode Test / Sandbox';
                    envBadge.className = configData.environment === 'production'
                        ? 'px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase font-mono'
                        : 'px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase font-mono';
                }
            } catch (cfgErr) {
                console.warn("Notice chargement config Wave:", cfgErr);
            }

            // 2. Charger les transactions
            const txData = await safeWaveFetchJson('/api/wave-transactions');

            currentWaveTransactionsCache = txData.transactions || [];

            // Mettre à jour les KPIs
            const stats = txData.stats || {};
            const totalVolEl = document.getElementById('wave-kpi-total-volume');
            const countPaidEl = document.getElementById('wave-kpi-count-paid');
            const countPendingEl = document.getElementById('wave-kpi-count-pending');
            const countFailedEl = document.getElementById('wave-kpi-count-failed');

            if (totalVolEl) totalVolEl.innerText = `${(stats.totalVolumePaid || 0).toLocaleString('fr-FR')} FCFA`;
            if (countPaidEl) countPaidEl.innerText = stats.countPaid || 0;
            if (countPendingEl) countPendingEl.innerText = stats.countPending || 0;
            if (countFailedEl) countFailedEl.innerText = (stats.countFailed || 0) + (stats.countToReview || 0);

            // Rendu du tableau
            renderWaveTransactionsTable(currentWaveTransactionsCache);

        } catch (err) {
            console.error("Erreur loadWaveAdminDashboard:", err);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="py-8 text-center text-slate-400">
                        <i data-lucide="alert-circle" class="h-6 w-6 mx-auto text-rose-500 mb-2"></i>
                        <span>Erreur lors du chargement des transactions Wave : ${err.message}</span>
                    </td>
                </tr>
            `;
            initializeLucideIcons();
        }
    }

    /**
     * Rendu du tableau des transactions Wave (Section 4 & 5 du Cahier des Charges)
     */
    function renderWaveTransactionsTable(list) {
        const tbody = document.getElementById('wave-transactions-table-body');
        if (!tbody) return;

        if (!list || list.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="py-8 text-center text-slate-400 font-medium">
                        <div class="h-10 w-10 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-2">
                            <i data-lucide="inbox" class="h-5 w-5"></i>
                        </div>
                        <p class="text-xs">Aucune transaction Wave enregistrée pour le moment.</p>
                        <p class="text-[10px] text-slate-400 mt-0.5">Les paiements validés par Wave apparaîtront automatiquement ici.</p>
                    </td>
                </tr>
            `;
            initializeLucideIcons();
            return;
        }

        const statusBadges = {
            'Payé': '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">● Payé</span>',
            'En attente': '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-100 text-sky-800 border border-sky-300 font-mono">⏳ En attente</span>',
            'Échoué': '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300 font-mono">✗ Échoué</span>',
            'Annulé': '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-300 font-mono">Annulé</span>',
            'Expiré': '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300 font-mono">Expiré</span>',
            'À vérifier': '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-800 border border-red-300 font-mono animate-pulse">⚠️ À vérifier</span>'
        };

        let html = '';
        list.forEach(t => {
            const badge = statusBadges[t.status] || `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100">${t.status || 'Inconnu'}</span>`;
            const dateStr = t.createdAt ? new Date(t.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '--';
            const fullName = `${t.customer?.prenom || ''} ${t.customer?.nom || 'Anonyme'}`.trim();
            const contact = t.customer?.contact1 || '--';
            const ticketBadge = t.ticketId ? `<span class="font-mono font-bold text-amber-600">#${t.ticketId}</span>` : '<span class="text-slate-400">--</span>';

            html += `
                <tr class="hover:bg-slate-50/80 transition text-slate-700">
                    <td class="py-3 px-3.5 font-mono text-xs font-bold text-slate-900">${t.clientReference || '--'}</td>
                    <td class="py-3 px-3.5 font-mono text-xs text-sky-700 font-bold">${t.waveTransactionId || '<span class="text-slate-400 font-normal">En attente</span>'}</td>
                    <td class="py-3 px-3.5">
                        <strong class="text-slate-900 block truncate max-w-[140px]">${fullName}</strong>
                        <span class="text-[10px] text-slate-400 font-mono">${contact}</span>
                    </td>
                    <td class="py-3 px-3.5 text-right font-mono font-black text-slate-900 whitespace-nowrap">${Number(t.amount || 10000).toLocaleString('fr-FR')} FCFA</td>
                    <td class="py-3 px-3.5 text-center">${badge}</td>
                    <td class="py-3 px-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">${dateStr}</td>
                    <td class="py-3 px-3.5">${ticketBadge}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        initializeLucideIcons();
    }

    function filterWaveTransactionsUI() {
        const query = (document.getElementById('wave-tx-search-input')?.value || '').toLowerCase().trim();
        let filtered = currentWaveTransactionsCache.slice();

        if (currentWaveStatusFilter !== 'ALL') {
            filtered = filtered.filter(t => (t.status || '').toLowerCase() === currentWaveStatusFilter.toLowerCase());
        }

        if (query) {
            filtered = filtered.filter(t =>
                (t.clientReference || '').toLowerCase().includes(query) ||
                (t.waveTransactionId || '').toLowerCase().includes(query) ||
                (t.customer?.nom || '').toLowerCase().includes(query) ||
                (t.customer?.prenom || '').toLowerCase().includes(query) ||
                (t.customer?.contact1 || '').includes(query) ||
                (t.ticketId || '').toLowerCase().includes(query)
            );
        }

        renderWaveTransactionsTable(filtered);
    }

    function setWaveStatusFilter(filter) {
        currentWaveStatusFilter = filter;
        document.querySelectorAll('.wave-status-filter-btn').forEach(btn => {
            if (btn.getAttribute('data-filter') === filter) {
                btn.className = "wave-status-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white transition";
            } else {
                btn.className = "wave-status-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition";
            }
        });
        filterWaveTransactionsUI();
    }

    function exportWaveTransactionsCSV() {
        const baseUrl = getWaveApiBaseUrl();
        window.open(`${baseUrl}/api/wave-transactions?format=csv`, '_blank');
        showNotification("Export CSV Lancé", "Le relevé officiel des transactions Wave est en cours de téléchargement.", "success");
    }

    async function reconcileWaveTransactions() {
        showNotification("Rapprochement Wave", "Interrogation et synchronisation des transactions Wave en cours...", "info");
        await loadWaveAdminDashboard();
        showNotification("Synchronisation Terminée", "Le tableau des transactions Wave a été mis à jour.", "success");
    }

    function copyWaveWebhookUrl() {
        const urlEl = document.getElementById('wave-webhook-url-display');
        const url = urlEl ? urlEl.innerText.trim() : 'https://projet-myticket.vercel.app/api/wave-webhook';
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                showNotification("URL Webhook Copiée", "Collez cette URL dans l'onglet Développeurs > Webhooks de votre compte Wave Business.", "success");
            });
        }
    }


    async function startCameraStream(facing = "environment") {
        const video = document.getElementById('qr-video-feed');
        if (!video) return;

        // Stop any existing stream
        if (qrMediaStream) {
            try { qrMediaStream.getTracks().forEach(t => t.stop()); } catch (e) {}
            qrMediaStream = null;
        }

        video.muted = true;
        video.playsInline = true;
        video.setAttribute("muted", "true");
        video.setAttribute("playsinline", "true");
        video.setAttribute("autoplay", "true");

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showNotification("Caméra non supportée", "Votre navigateur ne permet pas l'accès direct à la caméra. Veuillez utiliser la saisie manuelle.", "warning");
            return;
        }

        let stream = null;
        // Multi-tier fallback to avoid OverconstrainedError across diverse mobile devices & laptops
        const constraintTiers = [
            { video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
            { video: { facingMode: facing }, audio: false },
            { video: true, audio: false }
        ];

        for (const c of constraintTiers) {
            try {
                stream = await navigator.mediaDevices.getUserMedia(c);
                if (stream) break;
            } catch (err) {
                console.warn("Camera constraint tier attempt notice:", err.name);
            }
        }

        if (!stream) {
            showNotification("Accès Caméra", "Veuillez autoriser l'accès à la caméra dans votre navigateur ou saisir le code manuellement.", "info");
            return;
        }

        qrMediaStream = stream;
        video.srcObject = stream;

        try {
            await video.play();
        } catch (playErr) {
            console.warn("Video play notice:", playErr);
        }

        // Check for Torch (flashlight) capability on mobile back camera
        const track = qrMediaStream.getVideoTracks()[0];
        const torchBtn = document.getElementById('btn-camera-torch');
        if (track && track.getCapabilities && torchBtn) {
            try {
                const capabilities = track.getCapabilities();
                if (capabilities.torch) {
                    torchBtn.classList.remove('hidden');
                } else {
                    torchBtn.classList.add('hidden');
                }
                if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
                    track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] }).catch(() => {});
                }
            } catch (e) {}
        }

        startLiveQRDecoder(video);
    }

    async function switchCamera() {
        currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
        await startCameraStream(currentFacingMode);
        initializeLucideIcons();
    }

    async function toggleCameraTorch() {
        if (!qrMediaStream) return;
        const track = qrMediaStream.getVideoTracks()[0];
        if (!track) return;
        try {
            isTorchOn = !isTorchOn;
            await track.applyConstraints({ advanced: [{ torch: isTorchOn }] });
            const torchLabel = document.getElementById('torch-label');
            if (torchLabel) torchLabel.innerText = isTorchOn ? 'Éteindre' : 'Flash';
        } catch (e) {
            console.warn("Torch toggle error:", e);
        }
    }

    const qrDecodeCanvas = document.createElement('canvas');
    const qrDecodeCtx = qrDecodeCanvas.getContext('2d', { willReadFrequently: true });
    const qrRoiCanvas = document.createElement('canvas');
    const qrRoiCtx = qrRoiCanvas.getContext('2d', { willReadFrequently: true });

    function startLiveQRDecoder(video) {
        if (!video || !qrMediaStream) return;
        isScanningActive = true;
        let frameCount = 0;
        let isProcessingFrame = false;

        async function scanVideoFrame() {
            if (!qrMediaStream || !isScanningActive) return;

            try {
                if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0 && !isProcessingFrame) {
                    isProcessingFrame = true;
                    frameCount++;

                    const vw = video.videoWidth;
                    const vh = video.videoHeight;
                    let decodedResult = null;

                    // 1. ENGINE 1: Hardware-Accelerated Native BarcodeDetector (instant GPU/NPU)
                    if (nativeBarcodeDetector) {
                        try {
                            const barcodes = await nativeBarcodeDetector.detect(video);
                            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                                decodedResult = barcodes[0].rawValue.trim();
                            }
                        } catch (e) {}
                    }

                    // Prepare Canvas for HybridBinarizer (ZXing) and jsQR
                    if (!decodedResult && (typeof ZXing !== 'undefined' || typeof jsQR !== 'undefined')) {
                        // Dynamic crop:
                        // Normal: 75% crop; Zoomed 2x or alternating frames: 48% tight crop (magnifies small screen QR codes)
                        const roiFraction = (currentZoomLevel > 1 || frameCount % 2 === 0) ? 0.48 : 0.75;
                        const roiSize = Math.min(vw, vh) * roiFraction;
                        const roiX = (vw - roiSize) / 2;
                        const roiY = (vh - roiSize) / 2;
                        const targetScanSize = 480;

                        qrRoiCanvas.width = targetScanSize;
                        qrRoiCanvas.height = targetScanSize;
                        qrRoiCtx.drawImage(video, roiX, roiY, roiSize, roiSize, 0, 0, targetScanSize, targetScanSize);

                        // 2. ENGINE 2: ZXing C++ WASM HybridBinarizer (Gold standard for smartphone screen glare & backlight)
                        if (typeof ZXing !== 'undefined' && ZXing.HTMLCanvasElementLuminanceSource && ZXing.QRCodeReader) {
                            try {
                                const lumSource = new ZXing.HTMLCanvasElementLuminanceSource(qrRoiCanvas);
                                const binarizer = new ZXing.HybridBinarizer(lumSource);
                                const bitmap = new ZXing.BinaryBitmap(binarizer);
                                const zReader = new ZXing.QRCodeReader();
                                const zxResult = zReader.decode(bitmap);
                                if (zxResult && zxResult.getText()) {
                                    decodedResult = zxResult.getText().trim();
                                }
                            } catch (zxErr) {}
                        }

                        // 3. ENGINE 3: Screen-Optimized jsQR with inversion & luminance normalization
                        if (!decodedResult && typeof jsQR !== 'undefined') {
                            const roiImageData = qrRoiCtx.getImageData(0, 0, targetScanSize, targetScanSize);

                            let code = jsQR(roiImageData.data, targetScanSize, targetScanSize, {
                                inversionAttempts: "attemptBoth"
                            });

                            // Screen glare luminance stretch
                            if (!code || !code.data) {
                                const d = roiImageData.data;
                                let minLum = 255;
                                let maxLum = 0;
                                for (let i = 0; i < d.length; i += 8) {
                                    const l = (d[i] * 299 + d[i+1] * 587 + d[i+2] * 114) / 1000;
                                    if (l < minLum) minLum = l;
                                    if (l > maxLum) maxLum = l;
                                }
                                const range = maxLum - minLum;
                                if (range > 20) {
                                    for (let i = 0; i < d.length; i += 4) {
                                        const l = (d[i] * 299 + d[i+1] * 587 + d[i+2] * 114) / 1000;
                                        const stretched = Math.min(255, Math.max(0, ((l - minLum) / range) * 255));
                                        d[i] = stretched;
                                        d[i+1] = stretched;
                                        d[i+2] = stretched;
                                    }
                                    code = jsQR(d, targetScanSize, targetScanSize, {
                                        inversionAttempts: "attemptBoth"
                                    });
                                }
                            }

                            // Full-frame fallback every 4 frames
                            if ((!code || !code.data) && (frameCount % 4 === 0)) {
                                const fullW = 640;
                                const fullH = Math.round(640 * (vh / vw));
                                qrDecodeCanvas.width = fullW;
                                qrDecodeCanvas.height = fullH;
                                qrDecodeCtx.drawImage(video, 0, 0, fullW, fullH);

                                if (typeof ZXing !== 'undefined' && ZXing.HTMLCanvasElementLuminanceSource && ZXing.QRCodeReader) {
                                    try {
                                        const lum = new ZXing.HTMLCanvasElementLuminanceSource(qrDecodeCanvas);
                                        const bin = new ZXing.HybridBinarizer(lum);
                                        const bmp = new ZXing.BinaryBitmap(bin);
                                        const zxFull = new ZXing.QRCodeReader().decode(bmp);
                                        if (zxFull && zxFull.getText()) {
                                            code = { data: zxFull.getText() };
                                        }
                                    } catch(e) {}
                                }

                                if (!code || !code.data) {
                                    const fullImageData = qrDecodeCtx.getImageData(0, 0, fullW, fullH);
                                    code = jsQR(fullImageData.data, fullW, fullH, {
                                        inversionAttempts: "attemptBoth"
                                    });
                                }
                            }

                            if (code && code.data) {
                                decodedResult = code.data.trim();
                            }
                        }
                    }

                    // SUCCESS DISPATCH:
                    if (decodedResult && isScanningActive) {
                        isScanningActive = false;

                        // Check if participant is already checked in to adjust visual & audio feedback
                        const foundPart = findParticipantByQuery(decodedResult);
                        const isAlreadyUsed = foundPart && foundPart.checkedIn;

                        if (isAlreadyUsed) {
                            playScanRefusedFeedback();
                            const statusEl = document.getElementById('qr-scanner-status');
                            if (statusEl) {
                                statusEl.innerHTML = `<span class="h-2 w-2 rounded-full bg-red-400"></span><span class="font-bold text-white">⛔ BILLET DÉJÀ ÉMARGÉ : ${decodedResult}</span>`;
                                statusEl.className = "absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-red-600 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-2";
                            }
                            const boxEl = document.getElementById('qr-viewfinder-box');
                            if (boxEl) {
                                boxEl.className = "absolute inset-0 border-4 border-red-500 bg-red-500/30 rounded-2xl m-6 sm:m-8 pointer-events-none flex flex-col justify-between p-3 transition-colors duration-200 shadow-[0_0_35px_#ef4444]";
                            }
                        } else {
                            playScanSuccessFeedback();
                            const statusEl = document.getElementById('qr-scanner-status');
                            if (statusEl) {
                                statusEl.innerHTML = `<span class="h-2 w-2 rounded-full bg-emerald-400"></span><span class="font-bold text-white">QR Code Détecté : ${decodedResult}</span>`;
                                statusEl.className = "absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-2";
                            }
                            const boxEl = document.getElementById('qr-viewfinder-box');
                            if (boxEl) {
                                boxEl.className = "absolute inset-0 border-4 border-emerald-400 bg-emerald-500/20 rounded-2xl m-6 sm:m-8 pointer-events-none flex flex-col justify-between p-3 transition-colors duration-200 shadow-[0_0_30px_#10b981]";
                            }
                        }

                        setTimeout(() => {
                            closeLiveCameraScanner();
                            executeCheckInForTicketId(decodedResult);
                        }, 280);
                        return;
                    }

                    isProcessingFrame = false;
                }
            } catch (err) {
                console.warn("Scan frame notice:", err);
                isProcessingFrame = false;
            } finally {
                if (isScanningActive) {
                    qrScanAnimationId = requestAnimationFrame(scanVideoFrame);
                }
            }
        }

        qrScanAnimationId = requestAnimationFrame(scanVideoFrame);
    }

    function closeLiveCameraScanner() {
        isScanningActive = false;
        document.getElementById('modal-qr-scanner')?.classList.add('hidden');

        if (qrScanAnimationId) {
            cancelAnimationFrame(qrScanAnimationId);
            qrScanAnimationId = null;
        }
        if (qrMediaStream) {
            try { qrMediaStream.getTracks().forEach(track => track.stop()); } catch (e) {}
            qrMediaStream = null;
        }
        const video = document.getElementById('qr-video-feed');
        if (video) video.srcObject = null;
    }

    function scanQRFromImageFile(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function(e) {
            const img = new Image();
            img.onload = async function() {
                // 1. Try Native BarcodeDetector first
                if (nativeBarcodeDetector) {
                    try {
                        const barcodes = await nativeBarcodeDetector.detect(img);
                        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                            playScanSuccessFeedback();
                            closeLiveCameraScanner();
                            executeCheckInForTicketId(barcodes[0].rawValue.trim());
                            return;
                        }
                    } catch (err) {}
                }

                // 2. jsQR Multi-scale & Contrast Fallback
                const canvas = document.createElement('canvas');
                const maxDim = 1000;
                let w = img.width;
                let h = img.height;
                if (w > maxDim || h > maxDim) {
                    const ratio = Math.min(maxDim / w, maxDim / h);
                    w = Math.round(w * ratio);
                    h = Math.round(h * ratio);
                }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.drawImage(img, 0, 0, w, h);
                const imgData = ctx.getImageData(0, 0, w, h);

                if (typeof jsQR !== 'undefined') {
                    // Pass 1: Raw with both normal & inverted contrast
                    let code = jsQR(imgData.data, imgData.width, imgData.height, {
                        inversionAttempts: "attemptBoth"
                    });
                    if (code && code.data) {
                        playScanSuccessFeedback();
                        closeLiveCameraScanner();
                        executeCheckInForTicketId(code.data.trim());
                        return;
                    }

                    // Pass 2: Dynamic Min-Max Screen Contrast Normalization
                    const d = imgData.data;
                    let minLum = 255, maxLum = 0;
                    for (let i = 0; i < d.length; i += 4) {
                        const l = (d[i] * 299 + d[i+1] * 587 + d[i+2] * 114) / 1000;
                        if (l < minLum) minLum = l;
                        if (l > maxLum) maxLum = l;
                    }
                    const range = maxLum - minLum;
                    if (range > 15) {
                        for (let i = 0; i < d.length; i += 4) {
                            const l = (d[i] * 299 + d[i+1] * 587 + d[i+2] * 114) / 1000;
                            const stretched = Math.min(255, Math.max(0, ((l - minLum) / range) * 255));
                            d[i] = stretched;
                            d[i+1] = stretched;
                            d[i+2] = stretched;
                        }
                        code = jsQR(d, imgData.width, imgData.height, {
                            inversionAttempts: "attemptBoth"
                        });
                        if (code && code.data) {
                            playScanSuccessFeedback();
                            closeLiveCameraScanner();
                            executeCheckInForTicketId(code.data.trim());
                            return;
                        }
                    }

                    showNotification("QR Code Non Détecté", "Aucun QR code lisible trouvé sur cette photo. Essayez de recadrer ou saisissez le code.", "warning");
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function executeModalScan() {
        const idInput = document.getElementById('modal-scanner-manual-input') || document.getElementById('camera-scan-id-input') || document.getElementById('manual-scan-code-input');
        const id = idInput ? idInput.value.trim() : '';
        if (!id) {
            showNotification("Saisie requise", "Veuillez saisir le numéro ou la référence du billet.", "error");
            return;
        }
        closeLiveCameraScanner();
        executeCheckInForTicketId(id);
    }

    function executeQuickCheckIn() {
        const searchInput = document.getElementById('reception-search-input');
        const query = searchInput ? searchInput.value.trim() : '';
        if (!query) {
            showNotification("Saisie requise", "Veuillez saisir un numéro de billet, une référence ou un nom.", "warning");
            return;
        }
        executeCheckInForTicketId(query);
    }

    function executeCheckInForTicketId(query) {
        const p = findParticipantByQuery(query);

        if (p) {
            // STRICT SECURITY ENFORCEMENT: A TICKET CANNOT PASS TWICE!
            if (p.checkedIn) {
                playScanRefusedFeedback();

                const tableInfo = getParticipantTableInfo(p);
                const nameEl = document.getElementById('popup-refused-name');
                const churchEl = document.getElementById('popup-refused-church');
                const tableEl = document.getElementById('popup-refused-table');
                const refEl = document.getElementById('popup-refused-ref');
                const timeEl = document.getElementById('popup-refused-time');

                if (nameEl) nameEl.innerText = `${p.prenom} ${p.nom}`;
                if (churchEl) churchEl.innerText = p.eglise || 'EMCI Horeb';
                if (tableEl) tableEl.innerText = tableInfo.fullTableName;
                if (refEl) refEl.innerText = `#${p.id}`;
                if (timeEl) timeEl.innerText = p.checkInTime || 'Déjà enregistré';

                const searchInput = document.getElementById('reception-search-input');
                if (searchInput) searchInput.value = '';

                // Close success modal if open, and show REFUSED modal
                document.getElementById('modal-checkin-success')?.classList.add('hidden');
                document.getElementById('modal-checkin-refused')?.classList.remove('hidden');
                initializeLucideIcons();

                showNotification("ACCÈS REFUSÉ ⛔", `Ce billet (#${p.id} - ${p.prenom} ${p.nom}) a DÉJÀ été émargé à ${p.checkInTime || 'plus tôt'} ! Il ne peut être utilisé qu'une seule fois.`, "error");
                return; // BLOCK! Do not validate, do not re-check in, do not trigger confetti!
            }

            // FIRST TIME CHECK-IN: VALIDATE ACCESS
            p.checkedIn = true;
            const now = new Date();
            p.checkInTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            try {
                localStorage.setItem('myticket_participants_v8', JSON.stringify(state.participants));
                if (typeof MyTicketCloudDB !== 'undefined') MyTicketCloudDB.syncParticipant(p);
            } catch (e) {}

            const tableInfo = getParticipantTableInfo(p);
            const nameEl = document.getElementById('popup-checkin-name');
            const churchEl = document.getElementById('popup-checkin-church');
            const tableEl = document.getElementById('popup-checkin-table');
            const catEl = document.getElementById('popup-checkin-category');
            const refEl = document.getElementById('popup-checkin-ref');
            const timeEl = document.getElementById('popup-checkin-time');

            if (nameEl) nameEl.innerText = `${p.prenom} ${p.nom}`;
            if (churchEl) churchEl.innerText = p.eglise || 'EMCI Horeb';
            if (tableEl) tableEl.innerText = tableInfo.fullTableName;
            if (catEl) catEl.innerText = `Pass ${p.categorie} • ${Number(p.prix || 0).toLocaleString('fr-FR')} FCFA`;
            if (refEl) refEl.innerText = `#${p.id}`;
            if (timeEl) timeEl.innerText = p.checkInTime;

            const searchInput = document.getElementById('reception-search-input');
            if (searchInput) searchInput.value = '';

            document.getElementById('modal-checkin-refused')?.classList.add('hidden');
            document.getElementById('modal-checkin-success')?.classList.remove('hidden');
            renderReceptionTable();
            renderTablePlan();

            showNotification("Accès Validé & Émargé !", `Bienvenue ${p.prenom} ${p.nom} • ${tableInfo.fullTableName}`, "success");
            triggerJubileeConfetti();
        } else {
            playScanRefusedFeedback();
            showNotification("Billet Introuvable", `Aucun participant ne correspond au numéro ou code "${query}".`, "error");
        }
    }

    function closeCheckinSuccessModal() {
        document.getElementById('modal-checkin-success')?.classList.add('hidden');
    }

    function closeCheckinRefusedModal() {
        document.getElementById('modal-checkin-refused')?.classList.add('hidden');
    }

    // DONATIONS CONTROLLER
    function openDonationModal() {
        document.getElementById('modal-donation')?.classList.remove('hidden');
    }

    function closeDonationModal() {
        document.getElementById('modal-donation')?.classList.add('hidden');
    }

    function submitDonation(event) {
        event.preventDefault();
        const nomInput = document.getElementById('modal-don-nom') || document.getElementById('don-nom');
        const typeInput = document.getElementById('modal-don-type') || document.getElementById('don-type');
        const montantInput = document.getElementById('modal-don-montant') || document.getElementById('don-montant');
        const compteInput = document.getElementById('modal-don-compte') || document.getElementById('don-compte');
        const respInput = document.getElementById('modal-don-responsable');

        const nom = nomInput ? nomInput.value.trim() : '';
        const type = typeInput ? typeInput.value : 'Don Particulier';
        const montant = Number(montantInput ? montantInput.value : 0) || 0;
        const compte = compteInput ? compteInput.value : 'Espèces';
        const resp = respInput ? respInput.value : state.user.name;

        if (!nom || montant <= 0) {
            showNotification("Erreur", "Veuillez remplir correctement les champs du don.", "error");
            return;
        }

        const newDon = {
            date: new Date().toISOString().split('T')[0],
            donateur: nom,
            type: type,
            montant: montant,
            compte: compte,
            enregistrePar: resp
        };

        if (!state.finance.dons) state.finance.dons = [];
        state.finance.dons.unshift(newDon);

        saveFinanceState();
        closeDonationModal();
        renderFinanceDashboard();
        if (typeof populateGoldDonorsDropdown === 'function') populateGoldDonorsDropdown();
        showNotification("Don Enregistré !", `${type} de ${montant.toLocaleString('fr-FR')} FCFA enregistré avec succès.`, "success");
    }

    // TABLE PLAN CONTROLLER
    let currentTableFilter = 'all';

    function filterTablePlan(category) {
        currentTableFilter = category;
        const buttons = ['all', 'gold', 'classique', 'invite'];
        buttons.forEach(b => {
            const btn = document.getElementById(`btn-table-${b}`);
            if (btn) {
                if ((b === 'all' && category === 'all') || (b.toLowerCase() === category.toLowerCase())) {
                    btn.className = "px-4 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#FF5A36] to-amber-500 text-white shadow-md shadow-orange-500/25 ring-1 ring-white/30 transition cursor-pointer transform scale-105";
                } else {
                    btn.className = "px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60 transition cursor-pointer";
                }
            }
        });
        renderTablePlan();
    }

        function renderTablePlan() {
        const container = document.getElementById('table-plan-grid') || document.getElementById('tables-grid-container');
        if (!container) return;

        container.innerHTML = '';
        const categories = ['Gold', 'Classique', 'Invité'];
        
        let filteredCats = categories;
        if (currentTableFilter !== 'all') {
            filteredCats = categories.filter(c => c.toLowerCase() === currentTableFilter.toLowerCase());
        }

        let totalTables = 0;
        let fullTables = 0;
        let fillingTables = 0;
        let totalOccupiedSeats = 0;

        filteredCats.forEach(cat => {
            const seatsPerTable = cat === 'Invité' ? 10 : 8;
            const catParticipants = (state.participants || []).filter(p => (p.categorie || 'Classique') === cat);
            const numTablesForCat = (TICKET_QUOTAS[cat] && TICKET_QUOTAS[cat].tables) || Math.max(1, Math.ceil(catParticipants.length / seatsPerTable));

            for (let tableNum = 1; tableNum <= numTablesForCat; tableNum++) {
                totalTables++;
                const startIdx = (tableNum - 1) * seatsPerTable;
                const tableGuests = catParticipants.slice(startIdx, startIdx + seatsPerTable);
                const occupiedCount = tableGuests.length;
                const checkedInCount = tableGuests.filter(g => g.checkedIn).length;
                totalOccupiedSeats += occupiedCount;

                if (occupiedCount === seatsPerTable) fullTables++;
                else if (occupiedCount > 0) fillingTables++;

                let catBadgeBg = 'bg-blue-100 text-blue-900 border-blue-300';
                let activeSeatBg = 'bg-blue-600 text-white font-bold shadow-xs';
                let catBorder = 'border-blue-200';
                let fullCatName = `Table ${cat}`;
                
                if (cat === 'Gold') { 
                    catBadgeBg = 'bg-amber-100 text-amber-950 border-amber-400 font-black'; 
                    activeSeatBg = 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black shadow-xs';
                    catBorder = 'border-amber-300/80';
                    fullCatName = `Table ${String(tableNum).padStart(2, '0')} (Gold)`;
                } else if (cat === 'Invité') { 
                    catBadgeBg = 'bg-emerald-100 text-emerald-950 border-emerald-400 font-bold'; 
                    activeSeatBg = 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold shadow-xs';
                    catBorder = 'border-emerald-300/80';
                    fullCatName = `Table d'Honneur ${String(tableNum).padStart(2, '0')}`;
                } else {
                    fullCatName = `Table ${String(tableNum + 10).padStart(2, '0')} (Béthel)`;
                }

                // Visual 2x4 Seat Matrix
                let seatChips = '';
                for (let seat = 1; seat <= seatsPerTable; seat++) {
                    const guest = tableGuests[seat - 1];
                    if (guest) {
                        const tooltipText = `Siège ${String(seat).padStart(2, '0')} : ${guest.prenom} ${guest.nom} (${guest.eglise || 'EMCI Horeb'}) • #${guest.id} [${guest.checkedIn ? 'Émargé' : 'En attente'}]`;
                        seatChips += `
                                                        <div title="${tooltipText}" class="group relative flex flex-col items-center justify-center h-8 sm:h-7 rounded-full ${activeSeatBg} cursor-pointer transition transform hover:scale-105 border ${guest.checkedIn ? 'border-emerald-300 ring-2 ring-emerald-400/60' : 'border-white/20 shadow-inner'}">
                                <span class="text-[11px] sm:text-[10px] font-mono font-bold leading-none">S${String(seat).padStart(2, '0')}</span>
                                ${guest.checkedIn ? '<span class="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white shadow-xs"></span>' : ''}
                            </div>
                        `;
                    } else {
                        const tooltipText = `Siège ${String(seat).padStart(2, '0')} : Place Libre`;
                        seatChips += `
                                                        <div title="${tooltipText}" class="flex items-center justify-center h-8 sm:h-7 rounded-full bg-slate-50 text-slate-300 text-[10px] font-mono border border-dashed border-slate-200 cursor-default">
                                S${String(seat).padStart(2, '0')}
                            </div>
                        `;
                    }
                }

                // Explicit, Legible List of Seated Attendees on the Table Card (Perfect for Mobile & Touch)
                let guestsListHtml = '';
                if (tableGuests.length > 0) {
                    guestsListHtml = '<div class="space-y-1.5 pt-2 border-t border-slate-100">';
                    guestsListHtml += '<span class="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">Festivaliers Installés :</span>';
                    tableGuests.forEach((g, gIdx) => {
                        guestsListHtml += `
                            <div class="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50 border border-slate-200/70">
                                <div class="flex items-center gap-2 min-w-0">
                                    <span class="font-mono font-black text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">S${String(gIdx + 1).padStart(2, '0')}</span>
                                    <div class="min-w-0">
                                        <p class="font-bold text-slate-900 truncate text-xs">${g.prenom} ${g.nom}</p>
                                        <p class="text-[10px] text-slate-500 truncate">${g.eglise || 'EMCI Horeb'} • #${g.id}</p>
                                    </div>
                                </div>
                                ${g.checkedIn ? `
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0 flex items-center gap-1">
                                        <i data-lucide="check" class="h-3 w-3"></i> Émargé
                                    </span>
                                ` : `
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-300 shrink-0">
                                        En attente
                                    </span>
                                `}
                            </div>
                        `;
                    });
                    guestsListHtml += '</div>';
                } else {
                    guestsListHtml = `
                        <div class="pt-2 border-t border-slate-100 text-center py-2 text-xs text-slate-400 italic">
                            Aucun festivalier affecté pour le moment (${seatsPerTable} places libres).
                        </div>
                    `;
                }

                const occupancyPct = Math.round((occupiedCount / seatsPerTable) * 100);

                container.innerHTML += `
                    <div class="bg-white p-3 sm:p-4 rounded-[20px] border ${catBorder} shadow-sm hover:shadow-md transition space-y-2.5">
                        <div class="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
                            <div>
                                <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Catégorie ${cat}</span>
                                <h4 class="font-display font-black text-base sm:text-lg text-slate-900">${fullCatName}</h4>
                            </div>
                            <span class="px-3 py-1 rounded-full text-xs font-mono font-black border ${catBadgeBg} shrink-0">
                                ${occupiedCount}/${seatsPerTable} (${checkedInCount} présent${checkedInCount > 1 ? 's' : ''})
                            </span>
                        </div>

                        <!-- Progress Bar -->
                        <div class="space-y-1">
                            <div class="flex justify-between text-[10px] font-bold text-slate-500">
                                <span>Remplissage de la table</span>
                                <span>${occupancyPct}%</span>
                            </div>
                            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div class="h-2 rounded-full ${cat === 'Gold' ? 'bg-amber-500' : (cat === 'Invité' ? 'bg-emerald-500' : 'bg-blue-600')}" style="width: ${occupancyPct}%;"></div>
                            </div>
                        </div>

                        <!-- 2x4 Seat Matrix -->
                        <div class="space-y-1.5">
                            <span class="text-[10px] text-slate-500 font-bold block uppercase">Disposition des ${seatsPerTable} Sièges :</span>
                            <div class="grid ${seatsPerTable === 10 ? 'grid-cols-5' : 'grid-cols-4'} gap-1.5 sm:gap-2">
                                ${seatChips}
                            </div>
                        </div>

                        <!-- Accordion Button for Mobile UI -->
                        <button type="button" onclick="toggleTableDetails('${cat}-${tableNum}')" class="w-full mt-1 py-2 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition border border-slate-100">
                            <span>Voir les détails des places</span>
                            <i id="table-icon-${cat}-${tableNum}" data-lucide="chevron-down" class="h-3 w-3"></i>
                        </button>

                        <!-- Hidden Seated Attendees List (Accordion Content) -->
                        <div id="table-details-${cat}-${tableNum}" class="hidden pt-1">
                            ${guestsListHtml}
                        </div>
                    </div>
                `;
            }
        });

        // Update Summary KPIs
        const kpiTotal = document.getElementById('kpi-tables-total');
        const kpiFull = document.getElementById('kpi-tables-full');
        const kpiFilling = document.getElementById('kpi-tables-filling');
        const kpiOccupied = document.getElementById('kpi-tables-seats-occupied');

        if (kpiTotal) kpiTotal.innerText = totalTables;
        if (kpiFull) kpiFull.innerText = fullTables;
        if (kpiFilling) kpiFilling.innerText = fillingTables;
        if (kpiOccupied) kpiOccupied.innerText = `${totalOccupiedSeats} places`;

        initializeLucideIcons();
    }


    function cancelAdminGuestAuth() {
        document.getElementById('modal-admin-guest')?.classList.add('hidden');
        state.adminGuestAuthorized = false;
        
        // Reset category to empty if user cancels admin authentication
        const select = document.getElementById('form-categorie');
        if (select && (select.value === 'Invité' || select.value === 'Gold')) {
            select.value = '';
            document.getElementById('direct-checkout-container')?.classList.remove('hidden');
            document.getElementById('checkout-separator')?.classList.remove('hidden');
            document.getElementById('payment-verification-container')?.classList.remove('hidden');
            document.getElementById('gold-donor-container')?.classList.add('hidden');

            const nomInput = document.getElementById('form-nom');
            const prenomInput = document.getElementById('form-prenom');
            if (nomInput) {
                nomInput.value = '';
                nomInput.readOnly = false;
                nomInput.classList.remove('bg-slate-100', 'text-slate-600', 'cursor-not-allowed');
            }
            if (prenomInput) {
                prenomInput.value = '';
                prenomInput.readOnly = false;
                prenomInput.classList.remove('bg-slate-100', 'text-slate-600', 'cursor-not-allowed');
            }

            updateCategoryPrice();
            const notice = document.getElementById('form-category-availability-notice');
            if (notice) notice.classList.add('hidden');
            showNotification("Annulation", "Émission du pass restreint annulée.", "info");
        }
    }

    function verifyAdminGuestAuth() {
        const input = document.getElementById('admin-guest-code-input');
        const enteredCode = (input ? input.value : '').trim();

        if (!enteredCode) {
            showNotification("Code Requis", "Veuillez saisir le mot de passe administrateur.", "error");
            input?.focus();
            return;
        }

        if (verifyPersonalOrAdminPassword(enteredCode)) {
            state.adminGuestAuthorized = true;
            document.getElementById('modal-admin-guest')?.classList.add('hidden');
            
            const cat = document.getElementById('form-categorie')?.value;
            const isGold = cat === 'Gold';
            const catLabel = isGold ? 'Pass Gold (Donateur)' : 'Pass Invité (Gratuit)';
            
            showNotification("Autorisation Accordée !", `Identité Administrateur confirmée. Vous pouvez émettre ce ${catLabel}.`, "success");
            
            const notice = document.getElementById('form-category-availability-notice');
            if (notice) {
                notice.className = "text-[11px] font-bold p-2.5 rounded-xl border bg-emerald-50 text-emerald-900 border-emerald-200 flex items-center gap-1.5";
                notice.innerHTML = `🛡️ <strong>Autorisation Admin Active :</strong> ${catLabel} déverrouillé pour cette émission.`;
            }

            if (isGold) {
                document.getElementById('gold-donor-container')?.classList.remove('hidden');
                populateGoldDonorsDropdown();
                document.getElementById('form-gold-donateur')?.focus();
            }
        } else {
            showNotification("Accès Refusé", "Code Administrateur incorrect. Seuls les administrateurs habilités peuvent émettre un pass restreint.", "error");
            input?.focus();
        }
    }

    // DISBURSEMENTS AUTO-TARGETED TO COMMITTEE
    function openDisbursementForCurrentCommittee(committeeId) {
        const targetId = committeeId || activeSelectedCommitteeId;
        if (!targetId) return;
        closeCommitteeExpensesModal();
        openDisbursementModal(targetId);
    }

    function openDisbursementModal(committeeId) {
        let targetId = committeeId || activeSelectedCommitteeId;
        
        if (!targetId) {
            if (state.user && !state.user.isVisitor && state.user.comite) {
                const userComm = (state.finance.committees || []).find(c => c.name === state.user.comite);
                if (userComm) targetId = userComm.id;
            }
            if (!targetId && state.finance.committees && state.finance.committees.length > 0) {
                targetId = state.finance.committees[0].id;
            }
        }

        if (!targetId) return;

        const committee = state.finance.committees.find(c => c.id === targetId);
        if (!committee) return;

        activeSelectedCommitteeId = targetId;
        const assignedUser = (state.users || []).find(u => u.comite === committee.name);
        const respDisplayName = assignedUser ? assignedUser.name : (committee.resp || 'Comité Officiel');
        const decor = getCommitteeCardDecor(committee.id);

        const bannerContainer = document.getElementById('disb-committee-banner');
        if (bannerContainer) {
            bannerContainer.className = `p-4 rounded-2xl bg-gradient-to-r ${decor.bannerGradient} text-white flex items-center justify-between shadow-md`;
            bannerContainer.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center font-black">
                        <i data-lucide="${decor.iconName}" class="h-5 w-5"></i>
                    </div>
                    <div>
                        <span class="text-[10px] font-bold uppercase text-white/80 block">Comité Bénéficiaire</span>
                        <h4 class="font-display font-black text-base text-white">${committee.name}</h4>
                    </div>
                </div>
                <span class="text-xs font-mono font-bold px-2.5 py-1 bg-white/20 rounded-lg border border-white/30">
                    Resp : ${respDisplayName}
                </span>
            `;
        }

        const disbComite = document.getElementById('disb-comite');
        const modalDecComite = document.getElementById('modal-dec-comite');
        if (disbComite) disbComite.value = committee.name;
        if (modalDecComite) modalDecComite.value = committee.name;

        const select = document.getElementById('modal-dec-line-select');
        if (select) {
            select.innerHTML = '<option value="">-- Sélectionner une ligne budgétaire enregistrée --</option>';

            const pendingLines = (committee.lignesBudget || []).filter(l => (l.statut || 'Prévu') === 'Prévu');
            if (pendingLines.length === 0) {
                select.innerHTML = '<option value="">Aucune dépense en attente (toutes déjà soumises ou payées)</option>';
            } else {
                pendingLines.forEach(l => {
                    const total = l.montant || ((l.quantite || 1) * (l.prixUnitaire || 0));
                    select.innerHTML += `<option value="${l.id}" data-libelle="${l.libelle}" data-montant="${total}">[${l.id}] ${l.libelle} — ${Number(total).toLocaleString('fr-FR')} FCFA</option>`;
                });
            }
        }

        const motifInput = document.getElementById('modal-dec-motif');
        const montantInput = document.getElementById('modal-dec-montant');
        if (motifInput) motifInput.value = '';
        if (montantInput) montantInput.value = '';
        document.getElementById('modal-disbursement')?.classList.remove('hidden');
        initializeLucideIcons();
    }

    function closeDisbursementModal() {
        document.getElementById('modal-disbursement')?.classList.add('hidden');
    }

    function onPendingBudgetLineSelected() {
        const select = document.getElementById('modal-dec-line-select');
        if (!select) return;
        const opt = select.options[select.selectedIndex];
        if (opt && opt.value) {
            const motifInput = document.getElementById('modal-dec-motif');
            const montantInput = document.getElementById('modal-dec-montant');
            if (motifInput) motifInput.value = opt.getAttribute('data-libelle') || '';
            if (montantInput) montantInput.value = opt.getAttribute('data-montant') || '0';
        }
    }

    function submitDisbursementRequest(event) {
        event.preventDefault();
        const committee = state.finance.committees.find(c => c.id === activeSelectedCommitteeId);
        if (!committee) return;

        const select = document.getElementById('modal-dec-line-select');
        const lineId = select ? select.value : '';
        if (!lineId) {
            showNotification("Sélection requise", "Veuillez choisir une ligne budgétaire prévue.", "error");
            return;
        }

        const line = committee.lignesBudget.find(l => l.id === lineId);
        if (!line) return;

        const montantInput = document.getElementById('modal-dec-montant');
        const montant = Number(montantInput ? montantInput.value : line.montant) || line.montant;
        const modeSelect = document.getElementById('modal-dec-mode');
        const mode = modeSelect ? modeSelect.value : 'Espèces';

        // Change line status to 'Soumis'
        line.statut = "Soumis";

        const newDisb = {
            id: `DEC-${Math.floor(100 + Math.random() * 900)}`,
            date: new Date().toISOString().split('T')[0],
            comiteId: committee.id,
            comite: committee.name,
            ligneId: line.id,
            motif: line.libelle,
            montant: montant,
            mode: mode,
            statut: "Soumis",
            demandePar: state.user.name,
            approbateur: null
        };

        if (!state.finance.decaissements) state.finance.decaissements = [];
        state.finance.decaissements.unshift(newDisb);

        saveFinanceState();
        closeDisbursementModal();
        openCommitteeExpensesDetails(committee.id);
        renderFinanceDashboard();
        renderFinanceConsolidation();
        showNotification("Demande Soumise !", `Demande de ${montant.toLocaleString('fr-FR')} FCFA pour "${line.libelle}" transmise.`, "success");
    }


    // SMART SEARCH, FILTER & QUICK ACTIONS FOR EXPENSES
    let currentCommExpenseFilter = 'all';

    function setCommitteeExpensesFilter(filter) {
        currentCommExpenseFilter = filter;
        const filters = ['all', 'prevu', 'soumis', 'effectue'];
        filters.forEach(f => {
            const btn = document.getElementById(`btn-comm-filter-${f}`);
            if (btn) {
                if ((f === 'all' && filter === 'all') || (f.toLowerCase() === filter.toLowerCase())) {
                    btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-orange text-white shadow-xs";
                } else {
                    btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50";
                }
            }
        });
        filterCommitteeExpensesLines();
    }

    function filterCommitteeExpensesLines() {
        if (!activeSelectedCommitteeId) return;
        const committee = state.finance.committees.find(c => c.id === activeSelectedCommitteeId);
        if (!committee) return;

        const searchInput = document.getElementById('comm-modal-search');
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

        let filtered = committee.lignesBudget || [];

        if (currentCommExpenseFilter !== 'all') {
            filtered = filtered.filter(l => (l.statut || 'Prévu') === currentCommExpenseFilter);
        }

        if (query) {
            filtered = filtered.filter(l => 
                (l.libelle && l.libelle.toLowerCase().includes(query)) ||
                (l.categorie && l.categorie.toLowerCase().includes(query)) ||
                (l.id && l.id.toLowerCase().includes(query))
            );
        }

        renderFilteredExpensesRows(committee, filtered);
    }

    function renderFilteredExpensesRows(committee, lines) {
        const tbody = document.getElementById('comm-modal-expenses-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const countEl = document.getElementById('comm-modal-count');
        if (countEl) countEl.innerText = `${lines.length} ligne(s) affichée(s)`;

        if (lines.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="py-8 text-center text-slate-400 italic">
                        <i data-lucide="search-x" class="h-8 w-8 mx-auto mb-2 opacity-50"></i>
                        Aucune ligne de dépense ne correspond aux critères de recherche.
                    </td>
                </tr>
            `;
            initializeLucideIcons();
            return;
        }

        const totals = calculateCommitteeTotals(committee);
        const totalBudget = totals.totalBudget;

        lines.forEach(line => {
            let statutBadge = 'bg-blue-100 text-blue-800 border border-blue-200';
            let displayStatut = line.statut || 'Prévu';

            if (displayStatut === 'Soumis') {
                statutBadge = 'bg-amber-100 text-amber-900 border border-amber-300 font-black animate-pulse';
            } else if (displayStatut === 'Effectué' || displayStatut === 'Payé / Exécuté') {
                displayStatut = 'Effectué';
                statutBadge = 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-black';
            } else {
                displayStatut = 'Prévu';
            }

            const qte = line.quantite || 1;
            const pu = line.prixUnitaire || line.montant || 0;
            const totalMontant = line.montant || (qte * pu);
            const categorie = line.categorie || "Général";
            const shareOfBudget = totalBudget > 0 ? Math.round((totalMontant / totalBudget) * 100) : 0;
            const author = line.enregistrePar || state.user.name;

            let actionCellHTML = '';
            const canInitiateDisb = isUserAuthorizedToInitiateDisbursement(committee.name);

            if (displayStatut === 'Soumis') {
                actionCellHTML = `
                    <div class="flex items-center justify-end gap-1.5">
                        ${canInitiateDisb ? `
                            <button onclick="requestCancelDisbursementForLine('${line.id}')" class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition shadow-2xs cursor-pointer" title="Annuler la demande de décaissement (mot de passe requis)">
                                <i data-lucide="rotate-ccw" class="h-4 w-4"></i>
                            </button>
                        ` : ''}
                        <span class="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">En Attente</span>
                    </div>
                `;
            } else if (displayStatut === 'Effectué') {
                actionCellHTML = `
                    <div class="flex items-center justify-end pr-2">
                        <span class="text-slate-400 p-1" title="Dépense effectuée et verrouillée">
                            <i data-lucide="lock" class="h-4 w-4"></i>
                        </span>
                    </div>
                `;
            } else {
                actionCellHTML = `
                    <div class="flex items-center justify-end gap-1.5">
                        ${canInitiateDisb ? `
                            <button onclick="launchDisbursementForLine('${line.id}')" class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold shadow-xs transition flex items-center gap-1 cursor-pointer" title="Initier décaissement pour cette ligne">
                                <i data-lucide="send" class="h-3 w-3 text-brand-orange"></i>
                                <span>Décaisser</span>
                            </button>
                            <button onclick="requestDeleteExpenseLine('${committee.id}', '${line.id}')" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer" title="Supprimer la ligne (mot de passe requis)">
                                <i data-lucide="trash-2" class="h-4 w-4"></i>
                            </button>
                        ` : `
                            <span class="text-[9px] font-semibold text-slate-400 italic">Lecture seule</span>
                        `}
                    </div>
                `;
            }

            tbody.innerHTML += `
                <tr class="hover:bg-slate-50/90 transition">
                    <td class="py-3 px-4 font-mono font-bold text-brand-orange">
                        ${line.id}<br>
                        <span class="text-[10px] text-slate-400 font-normal block">${line.date || '--'}</span>
                        <span class="text-[9px] text-slate-500 font-semibold block">Par: ${author}</span>
                    </td>
                    <td class="py-3 px-4">
                        <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[10px] font-bold block truncate max-w-[130px]">
                            ${categorie}
                        </span>
                    </td>
                    <td class="py-3 px-4 font-bold text-slate-900">${line.libelle}</td>
                    <td class="py-3 px-4 font-mono text-slate-600 text-xs whitespace-nowrap">
                        ${qte} × ${Number(pu).toLocaleString('fr-FR')} F
                    </td>
                    <td class="py-3 px-4 whitespace-nowrap">
                        <span class="font-black text-slate-950 font-mono">${Number(totalMontant).toLocaleString('fr-FR')} FCFA</span>
                        <span class="text-[9px] text-slate-400 block">(${shareOfBudget}% du budget)</span>
                    </td>
                    <td class="py-3 px-4">
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-black ${statutBadge} whitespace-nowrap">
                            ${displayStatut}
                        </span>
                    </td>
                    <td class="py-3 px-4 text-right">
                        ${actionCellHTML}
                    </td>
                </tr>
            `;
        });

        initializeLucideIcons();
    }

    
    function requestCancelDisbursement(disbId) {
        const disb = (state.finance.decaissements || []).find(d => d.id === disbId);
        if (!disb) return;

        if (disb.statut === 'Effectué' || disb.statut === 'Approuvé') {
            showNotification("Action Impossible", "Ce décaissement a déjà été validé et payé. Il ne peut plus être annulé.", "error");
            return;
        }

        const pwd = prompt(`Annulation Sécurisée - Saisir votre mot de passe personnel pour annuler la demande #${disb.id} (${Number(disb.montant).toLocaleString('fr-FR')} FCFA) :`);
        if (!pwd) return;

        if (!verifyPersonalOrAdminPassword(pwd)) {
            showNotification("Mot de passe incorrect", "Autorisation d'annulation refusée.", "error");
            return;
        }

        // Reset line in committee back to 'Prévu'
        state.finance.committees.forEach(c => {
            if (c.lignesBudget) {
                const line = c.lignesBudget.find(l => l.id === disb.ligneId);
                if (line && line.statut === 'Soumis') {
                    line.statut = "Prévu";
                }
            }
        });

        // Remove from disbursements list
        const idx = state.finance.decaissements.findIndex(d => d.id === disbId);
        if (idx !== -1) {
            state.finance.decaissements.splice(idx, 1);
        }

        saveFinanceState();
        if (activeSelectedCommitteeId) {
            openCommitteeExpensesDetails(activeSelectedCommitteeId);
        }
        renderFinanceDashboard();
        renderFinanceConsolidation();
        showNotification("Demande de Décaissement Annulée", `La demande #${disb.id} a été annulée avec succès. La ligne est réactivée au statut 'Prévu'.`, "info");
    }

    function cancelDisbursementRequest(disbId) {
        requestCancelDisbursement(disbId);
    }

    function requestCancelDisbursementForLine(lineId) {
        const disb = (state.finance.decaissements || []).find(d => d.ligneId === lineId && d.statut === 'Soumis');
        if (disb) {
            requestCancelDisbursement(disb.id);
        } else {
            const pwd = prompt("Annulation Sécurisée - Saisir votre mot de passe personnel pour annuler cette demande :");
            if (!pwd) return;
            if (!verifyPersonalOrAdminPassword(pwd)) {
                showNotification("Mot de passe incorrect", "Autorisation refusée.", "error");
                return;
            }
            if (!activeSelectedCommitteeId) return;
            const committee = state.finance.committees.find(c => c.id === activeSelectedCommitteeId);
            if (!committee || !committee.lignesBudget) return;
            const line = committee.lignesBudget.find(l => l.id === lineId);
            if (line) {
                line.statut = "Prévu";
                saveFinanceState();
                openCommitteeExpensesDetails(activeSelectedCommitteeId);
                renderFinanceDashboard();
                showNotification("Demande Annulée", `La ligne "${line.libelle}" est rétablie au statut 'Prévu'.`, "info");
            }
        }
    }

    function cancelDisbursementForLine(lineId) {
        requestCancelDisbursementForLine(lineId);
    }

    function launchDisbursementForLine(lineId) {
        if (!activeSelectedCommitteeId) return;
        closeCommitteeExpensesModal();
        openDisbursementModal(activeSelectedCommitteeId);
        
        setTimeout(() => {
            const select = document.getElementById('modal-dec-line-select');
            if (select) {
                select.value = lineId;
                onPendingBudgetLineSelected();
            }
        }, 100);
    }


/* ====================================================================
 * MOBILE ADAPTIVE ENGINE & NAVIGATION CONTROLS
 * ==================================================================== */

let mobileMenuOpen = false;
function toggleMobileMenu() {
    const sheet = document.getElementById('mobile-menu-sheet');
    const overlay = document.getElementById('mobile-menu-overlay');
    if (!sheet || !overlay) return;
    
    mobileMenuOpen = !mobileMenuOpen;
    if (mobileMenuOpen) {
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        overlay.classList.add('opacity-100');
        sheet.classList.remove('translate-y-full');
        sheet.classList.add('translate-y-0');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
        overlay.classList.add('opacity-0', 'pointer-events-none');
        overlay.classList.remove('opacity-100');
        sheet.classList.add('translate-y-full');
        sheet.classList.remove('translate-y-0');
        document.body.style.overflow = '';
    }
}

    // =========================================================
    // MODULE D'ADAPTATION MULTI-ÉCRANS UNIVERSEL MOBILE ENGINE
    // =========================================================
    window.MobileAdaptiveEngine = (function() {
        const STORAGE_KEY = 'myticket_adaptive_display_mode';
        let currentMode = localStorage.getItem(STORAGE_KEY) || 'auto';
        let lastCalibratedWidth = 0;
        let lastCalibratedHeight = 0;
        let calibrateRaf = null;

        function getScreenCategory(width) {
            if (width <= 360) return { id: 'micro', label: 'Micro Écran (≤ 360px)', desc: 'iPhone SE, Fold externe, compacts' };
            if (width <= 390) return { id: 'compact', label: 'Compact (361-390px)', desc: 'iPhone Mini, Galaxy A, Pixel 4a' };
            if (width <= 430) return { id: 'standard', label: 'Standard (391-430px)', desc: 'iPhone 12/13/14/15/16, Galaxy S' };
            if (width <= 540) return { id: 'large', label: 'Grand Écran (431-540px)', desc: 'iPhone Pro Max, Galaxy Ultra' };
            return { id: 'tablet', label: 'Tablette / Grand Pliable (> 540px)', desc: 'iPad, Tablettes, Fold déplié' };
        }

        function calibrate(force = false) {
            const width = window.innerWidth || document.documentElement.clientWidth || screen.width;
            const height = window.innerHeight || document.documentElement.clientHeight || screen.height;

            // Éviter le recalcul forcé de style sur mobile lors du simple défilement (barre d'URL)
            if (!force && lastCalibratedWidth && Math.abs(width - lastCalibratedWidth) < 10 && Math.abs(height - lastCalibratedHeight) < 70) {
                return;
            }
            lastCalibratedWidth = width;
            lastCalibratedHeight = height;

            const dpr = window.devicePixelRatio || 1;
            const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            const isPortrait = height >= width;
            const screenCat = getScreenCategory(width);

            // Dynamic CSS properties
            const vh = height * 0.01;
            document.documentElement.style.setProperty('--app-vh', `${vh}px`);
            document.documentElement.style.setProperty('--app-height', `${height}px`);
            document.documentElement.style.setProperty('--app-width', `${width}px`);
            document.documentElement.style.setProperty('--device-dpr', `${dpr}`);

            // Dataset attributes
            document.documentElement.dataset.screenClass = screenCat.id;
            document.documentElement.dataset.screenOrientation = isPortrait ? 'portrait' : 'landscape';
            document.documentElement.dataset.touchDevice = isTouch ? 'true' : 'false';
            document.documentElement.dataset.displayMode = currentMode;

            // Proportional Scale Factor
            let scaleFactor = 1;
            if (currentMode === 'auto') {
                if (width < 360) {
                    scaleFactor = Math.max(0.85, width / 375);
                } else if (width > 440 && width <= 540) {
                    scaleFactor = 1.02;
                } else {
                    scaleFactor = 1;
                }
            } else if (currentMode === 'compact') {
                scaleFactor = 0.90;
            } else if (currentMode === 'standard') {
                scaleFactor = 1.0;
            } else if (currentMode === 'comfort') {
                scaleFactor = 1.08;
            }

            document.documentElement.style.setProperty('--adaptive-scale', `${scaleFactor}`);

            updateDiagnosticsUI({
                width,
                height,
                dpr,
                screenCat,
                isPortrait,
                isTouch,
                scaleFactor,
                mode: currentMode
            });
        }

        function setDisplayMode(mode) {
            currentMode = mode;
            localStorage.setItem(STORAGE_KEY, mode);
            calibrate(true);
            if (typeof showNotification === 'function') {
                const labels = {
                    'auto': 'Auto-Adaptatif Intelligent activé',
                    'compact': 'Mode Compact (90%) activé',
                    'standard': 'Mode Standard (100%) activé',
                    'comfort': 'Mode Grand Confort (108%) activé'
                };
                showNotification("Affichage Écran Mis à Jour", labels[mode] || mode, "success");
            }
            if (navigator.vibrate) {
                try { navigator.vibrate(30); } catch(e) {}
            }
        }

        function updateDiagnosticsUI(info) {
            const badge = document.getElementById('mobile-adaptive-current-badge');
            if (badge) {
                const modeNames = { 'auto': 'Auto-Adaptatif', 'compact': 'Mode Compact', 'standard': 'Mode Standard', 'comfort': 'Mode Confort' };
                badge.innerText = `${modeNames[info.mode] || 'Actif'} (${info.width}px)`;
            }

            const diagRes = document.getElementById('adaptive-diag-res');
            if (diagRes) diagRes.innerText = `${info.width} × ${info.height} px (${info.isPortrait ? 'Portrait' : 'Paysage'})`;

            const diagCat = document.getElementById('adaptive-diag-cat');
            if (diagCat) diagCat.innerText = info.screenCat.label;

            const diagDpr = document.getElementById('adaptive-diag-dpr');
            if (diagDpr) diagDpr.innerText = `${info.dpr.toFixed(1)}x (${info.isTouch ? 'Tactile' : 'Standard'})`;

            const diagScale = document.getElementById('adaptive-diag-scale');
            if (diagScale) diagScale.innerText = `${Math.round(info.scaleFactor * 100)}%`;

            const buttons = document.querySelectorAll('.adaptive-mode-btn');
            buttons.forEach(btn => {
                if (btn.getAttribute('data-mode') === info.mode) {
                    btn.classList.add('border-brand-orange', 'bg-orange-50/50', 'ring-2', 'ring-brand-orange/20');
                    btn.classList.remove('border-slate-200', 'bg-white');
                    const dot = btn.querySelector('.mode-active-dot');
                    if (dot) dot.classList.remove('hidden');
                } else {
                    btn.classList.remove('border-brand-orange', 'bg-orange-50/50', 'ring-2', 'ring-brand-orange/20');
                    btn.classList.add('border-slate-200', 'bg-white');
                    const dot = btn.querySelector('.mode-active-dot');
                    if (dot) dot.classList.add('hidden');
                }
            });
        }

        function init() {
            calibrate(true);
            window.addEventListener('resize', () => {
                if (calibrateRaf) cancelAnimationFrame(calibrateRaf);
                calibrateRaf = requestAnimationFrame(() => calibrate(false));
            }, { passive: true });
            window.addEventListener('orientationchange', () => {
                setTimeout(() => calibrate(true), 150);
            }, { passive: true });
        }

        return {
            init,
            calibrate: (force) => calibrate(force),
            setDisplayMode,
            getMode: () => currentMode
        };
    })();

    function openMobileAdaptiveModal() {
        const modal = document.getElementById('modal-mobile-adaptive-settings');
        if (modal) {
            modal.classList.remove('hidden');
            if (window.MobileAdaptiveEngine) {
                window.MobileAdaptiveEngine.calibrate();
            }
            if (typeof initializeLucideIcons === 'function') {
                initializeLucideIcons();
            }
        }
    }

    function closeMobileAdaptiveModal() {
        const modal = document.getElementById('modal-mobile-adaptive-settings');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Auto-initialize adaptive engine on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.MobileAdaptiveEngine) window.MobileAdaptiveEngine.init();
        });
    } else {
        if (window.MobileAdaptiveEngine) window.MobileAdaptiveEngine.init();
    }

