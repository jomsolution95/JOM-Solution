
import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://jomsolution95_db_user:AlhamdulilLah95@clusterjomsolution.f6sns0s.mongodb.net/jom_solution_db?retryWrites=true&w=majority&appName=ClusterJomSolution';

async function checkConnection() {
    console.log('------------------------------------------------');
    console.log(' DIAGNOSTIC DE CONNEXION MONGODB ATLAS');
    console.log('------------------------------------------------');
    console.log(`URI Cible: ${MONGO_URI.replace(/:([^:@]+)@/, ':****@')}`); // Hide password in logs
    console.log('Tentative de connexion en cours...');

    try {
        const start = Date.now();
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // 5 seconds timeout
        });
        const duration = Date.now() - start;

        console.log(`\n[SUCCÈS] Connecté à MongoDB Atlas en ${duration}ms!`);

        const state = mongoose.connection.readyState;
        const stateName = ['disconnected', 'connected', 'connecting', 'disconnecting'][state];
        console.log(`État de la connexion: ${stateName} (${state})`);

        console.log('Vérification de la base de données...');
        const dbs = await mongoose.connection.db?.admin().listDatabases();
        console.log('Bases disponibles:', dbs?.databases.map(db => db.name).join(', '));

    } catch (error: any) {
        console.error('\n[ÉCHEC] Impossible de se connecter.');
        console.error('Erreur:', error.message);
        console.error('Code:', error.code);
        console.error('Nom:', error.name);
        if (error.reason) console.error('Raison:', error.reason);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        console.log('\n------------------------------------------------');
    }
}

checkConnection();
