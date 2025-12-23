# Guide d'Acquisition et Configuration VPS Hostinger

## 1. Choix de l'Offre VPS

Pour JOM Solution (Full Stack : Node.js + MongoDB + React + Nginx), nous recommandons le plan **KVM 2** pour des performances optimales.

1.  Allez sur [Hostinger VPS](https://www.hostinger.fr/vps-hosting).
2.  Sélectionnez l'offre **KVM 2** (4 Go RAM, 2 vCPU, 100 Go NVMe).
    *   *Note : Le KVM 1 (4 Go RAM, 1 vCPU) peut suffire pour démarrer, mais le KVM 2 est plus confortable pour MongoDB et le build.*
3.  Choisissez la durée (12 mois ou 24 mois offrent souvent le meilleur tarif).
4.  Créez votre compte et procédez au paiement.

## 2. Configuration Initiale (Setup Wizard)

Une fois l'achat validé, vous accéderez au panneau de configuration (hPanel). Lancez la configuration :

1.  **Emplacement du serveur :** Choisissez **France** (ou le plus proche de votre cible, par exemple US ou Singapour si applicable, mais France est recommandé pour l'Afrique de l'Ouest/Europe).
2.  **Type de système d'exploitation :**
    *   Choisissez **OS with Control Panel** (OS avec panneau) ou **Plain OS** (OS seul).
    *   Recommandation : **Plain OS** -> **Ubuntu 22.04 LTS** (ou 24.04). C'est le standard pour notre stack.
3.  **Mot de passe root :** Créez un mot de passe très fort (et conservez-le précieusement, c'est la clé de votre serveur).
4.  Validez et attendez l'installation (environ 5 minutes).

## 3. Connexion SSH

Une fois le serveur "Running" (Actif) :

1.  Notez l'adresse **IP SSH** affichée dans le tableau de bord (ex: `192.168.1.50`).
2.  Ouvrez votre terminal (Windows PowerShell ou Cmd).
3.  Connectez-vous :
    ```bash
    ssh root@votre_ip
    # Exemple : ssh root@192.168.1.50
    ```
4.  Tapez `yes` pour accepter l'empreinte, puis entrez votre mot de passe (il ne s'affiche pas quand vous tapez, c'est normal).

## 4. Préparation du Serveur (Premières commandes)

Une fois connecté en SSH, exécutez ces commandes pour mettre à jour et sécuriser la base :

```bash
# Mettre à jour la liste des paquets
apt update && apt upgrade -y

# Installer Docker et Docker Compose
apt install docker.io docker-compose -y

# Vérifier l'installation
docker --version
docker-compose --version
```

## 5. Prochaines Étapes (Déploiement)

Une fois votre VPS prêt, nous pourrons :
1.  Cloner votre projet depuis GitHub.
2.  Configurer les variables d'environnement (`.env.production`).
3.  Lancer `docker-compose up -d --build`.
4.  Configurer le nom de domaine (DNS) pour pointer vers l'IP du VPS.

**Avez-vous déjà un nom de domaine ?** (ex: jom-solution.com)
Si oui, pensez à changer les **Enregistrements A** (DNS) pour pointer vers l'IP de votre nouveau VPS.
