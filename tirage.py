import csv
import random
import time
import sys

def clear_console():
    # Clears screen on macOS/Linux
    print("\033[H\033[J", end="")

def run_tirage():
    # Filename configuration (matches the default download name)
    import os
    csv_files = [f for f in os.listdir('.') if f.startswith('tombola_pixou_participants') and f.endswith('.csv')]
    
    if not csv_files:
        print("❌ Erreur : Aucun fichier d'export CSV trouvé dans le dossier actuel !")
        print("💡 Veuillez copier le fichier exporté (ex: 'tombola_pixou_participants_2026-05-29.csv') dans ce dossier.")
        sys.exit(1)
        
    target_file = csv_files[0]
    print(f"📦 Lecture du fichier de participation : '{target_file}'...")
    
    participants = []
    
    # Read CSV with UTF-8 BOM encoding for correct French character support
    with open(target_file, mode='r', encoding='utf-8-sig') as f:
        reader = csv.reader(f, delimiter=';')
        
        # Skip header
        try:
            header = next(reader)
        except StopIteration:
            print("❌ Erreur : Le fichier CSV est vide !")
            sys.exit(1)
            
        for row in reader:
            if len(row) >= 5:
                participants.append({
                    'ticket': row[0].strip(),
                    'date': row[1].strip(),
                    'prenom': row[2].strip(),
                    'nom': row[3].strip(),
                    'email': row[4].strip(),
                    'telephone': row[5].strip() if len(row) > 5 else ''
                })

    total = len(participants)
    if total == 0:
        print("❌ Erreur : Aucun participant valide trouvé dans le fichier !")
        sys.exit(1)
        
    print(f"✅ Chargement réussi ! Nombre de participants en lice : {total}")
    print("\n--- PRÊT POUR LE TIRAGE AU SORT DU GROS LOT ---")
    input("👉 Appuyez sur ENTRÉE pour lancer le tirage au sort...")
    
    clear_console()
    
    # Premium dramatic countdown
    print("🥁 Lancement du tirage au sort...")
    time.sleep(1.5)
    
    for i in range(5, 0, -1):
        clear_console()
        print("🔮 Sélection aléatoire du gagnant en cours...")
        print(f"\n⚡️ [ {i} ] ⚡️")
        time.sleep(1.0)
        
    clear_console()
    print("🎉 LE TIRAGE A ÉTÉ EFFECTUÉ ! 🎉")
    print("=========================================")
    time.sleep(0.5)
    
    # Choose fair random winner
    winner = random.choice(participants)
    
    print("\n🏆 FÉLICITATIONS AU GAGNANT ! 🏆\n")
    print(f"  🎫 Ticket N°  : \033[1;31m{winner['ticket']}\033[0m")
    print(f"  👤 Prénom     : {winner['prenom']}")
    print(f"  🏷️ Nom        : {winner['nom']}")
    print(f"  📧 E-mail     : {winner['email']}")
    print(f"  📞 Téléphone  : \033[1;32m{winner['telephone']}\033[0m")
    print("\n=========================================")
    print("💡 Veuillez vérifier sa présence au Stade Jean Guimier pour la remise du lot !")

if __name__ == '__main__':
    run_tirage()
