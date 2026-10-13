import { Link } from 'react-router-dom';
import LegalDoc from '../../components/legal/LegalDoc';
import type { LegalSection } from '../../components/legal/LegalDoc';

const sections: LegalSection[] = [
    {
        heading: 'Article 1 — Objet et champ d’application',
        paragraphs: [
            '1.1. Les présentes conditions générales (les « CGU ») régissent l’accès à la Plateforme, son utilisation et le Service DPECERT décrit à l’article 4.',
            '1.2. Elles s’appliquent aux Utilisateurs agissant en qualité de consommateurs ou de non-professionnels. [Les professionnels souhaitant commander un diagnostic pour les besoins de leur activité sont soumis à des conditions distinctes, disponibles sur demande.]',
            '1.3. Les CGU ne régissent pas le Contrat de Diagnostic conclu entre l’Utilisateur et le Diagnostiqueur. Ce contrat est soumis aux conditions du Diagnostiqueur, communiquées avant toute Réservation, et aux dispositions légales impératives. Les CGU décrivent toutefois, pour votre information, le cadre dans lequel ce contrat est conclu via la Plateforme.',
            '1.4. L’Utilisateur accepte les CGU en cochant la case prévue à cet effet lors de la création de son Compte et avant toute Réservation. Les CGU sont accessibles à tout moment sur la Plateforme et peuvent être téléchargées et imprimées. Elles sont jointes à l’e-mail de confirmation de chaque Réservation.',
            '1.5. Les CGU sont complétées par la Politique de paiement, d’annulation et de remboursement, la Politique de confidentialité et de protection des données, la Politique relative aux cookies et autres technologies de traçage et les Mentions légales, accessibles depuis toutes les pages de la Plateforme. En cas de contradiction entre ces documents et les CGU, la disposition la plus favorable à l’Utilisateur s’applique.',
        ],
    },
    {
        heading: 'Article 2 — Définitions',
        paragraphs: ['Dans les CGU, les termes suivants ont le sens indiqué ci-dessous :'],
        bullets: [
            'Compte : l’espace personnel de l’Utilisateur sur la Plateforme.',
            'Contrat de Diagnostic : le contrat conclu directement entre l’Utilisateur et le Diagnostiqueur pour la réalisation du Diagnostic.',
            'Diagnostic : le diagnostic de performance énergétique (DPE) et toute prestation professionnelle réglementée qui s’y rattache, réalisés par le Diagnostiqueur.',
            'Diagnostiqueur : le professionnel indépendant, personne physique ou morale, certifié pour réaliser le Diagnostic et référencé sur la Plateforme.',
            'Frais de plateforme : le prix du Service DPECERT payé par l’Utilisateur à DPECERT.',
            'Plateforme : le site www.dpecert.fr et tout service en ligne qui s’y rattache.',
            'Prestataire de paiement : le prestataire de services de paiement agréé auquel DPECERT recourt pour encaisser les Frais de plateforme.',
            'Prix du Diagnostic : le prix professionnel du Diagnostic, fixé ou déterminé par le Diagnostiqueur et payé directement à celui-ci.',
            'Réservation : la demande de rendez-vous confirmée selon l’article 7.',
            'Service DPECERT : le service de mise en relation et de gestion de Réservation décrit à l’article 4.',
            'Utilisateur ou vous : toute personne physique majeure utilisant la Plateforme à des fins non professionnelles.',
        ],
    },
    {
        heading: 'Article 3 — Qui exploite la Plateforme ?',
        paragraphs: [
            '3.1. La Plateforme est exploitée par [DÉNOMINATION SOCIALE], [forme sociale] au capital de [●], immatriculée au [registre] sous le numéro [●], dont le siège social est situé [adresse], numéro de TVA intracommunautaire [●] (« DPECERT »).',
            '3.2. Service client : [adresse e-mail] — [formulaire de contact] — [numéro de téléphone, coût de l’appel] — [jours et horaires].',
            '3.3. Le directeur de la publication et l’hébergeur de la Plateforme sont indiqués dans les Mentions légales.',
        ],
    },
    {
        heading: 'Article 4 — Le rôle de DPECERT : un intermédiaire',
        paragraphs: [
            '4.1. DPECERT est un opérateur de plateforme en ligne au sens de l’article L. 111-7 du Code de la consommation. Il met en relation des Utilisateurs avec des Diagnostiqueurs indépendants.',
            '4.2. Le Service DPECERT comprend :',
        ],
        bullets: [
            'la présentation des Diagnostiqueurs et de leurs offres ;',
            'un outil de recherche et de comparaison ;',
            'la transmission de votre demande au Diagnostiqueur choisi et la réservation d’un créneau selon les disponibilités qu’il a déclarées ;',
            'la confirmation de la Réservation et l’envoi des notifications utiles ;',
            'une messagerie entre vous et le Diagnostiqueur [le cas échéant] ;',
            'l’encaissement des Frais de plateforme par l’intermédiaire du Prestataire de paiement ;',
            'la fonctionnalité de rétractation en ligne (article 10) ;',
            'les vérifications décrites à l’article 5.3 ;',
            'un service client pour toute question relative à la Plateforme.',
        ],
    },
    {
        heading: '',
        paragraphs: [
            '4.3. DPECERT ne réalise aucun Diagnostic. En particulier, DPECERT n’effectue ni visite, ni relevé, ni mesure, ni calcul. DPECERT ne détermine pas l’étiquette énergétique ou climatique, ne rédige pas le rapport, ne le transmet pas à l’ADEME et ne délivre aucun conseil technique. DPECERT ne fixe pas le Prix du Diagnostic et ne peut ni demander ni influencer un résultat.',
            '4.4. Le Contrat de Diagnostic est conclu directement entre vous et le Diagnostiqueur. DPECERT n’est pas partie à ce contrat et n’agit pas comme votre mandataire.',
            '4.5. Les Diagnostiqueurs exercent en toute indépendance. Aucun lien de subordination, de mandat ou d’association n’existe entre eux et DPECERT. DPECERT ne perçoit aucune rémunération des Diagnostiqueurs. La rémunération de DPECERT au titre du Service DPECERT est constituée des Frais de plateforme.',
            '4.6. Vous restez libre de faire appel ultérieurement au Diagnostiqueur de votre choix, directement ou par l’intermédiaire de la Plateforme.',
        ],
    },
    {
        heading: 'Article 5 — Informations sur le fonctionnement de la Plateforme',
        paragraphs: [
            'Les informations du présent article sont également accessibles, sans création de Compte, depuis la rubrique « Comment fonctionne DPECERT » présente sur toutes les pages de la Plateforme.',
            '5.1. Qualité des offreurs. Seuls des professionnels exerçant l’activité de diagnostiqueur immobilier peuvent proposer leurs services sur la Plateforme. Aucun particulier ne peut y déposer d’offre.',
            '5.2. Informations affichées pour chaque Diagnostiqueur. Avant toute Réservation, la fiche du Diagnostiqueur indique notamment :',
        ],
        bullets: [
            'son identité ou sa dénomination, sa forme juridique, son adresse, son numéro SIREN et ses coordonnées ;',
            'l’organisme ayant délivré sa certification, le numéro, le domaine et la date de validité de celle-ci ;',
            'l’assureur de sa responsabilité civile professionnelle ;',
            'le Prix du Diagnostic toutes taxes comprises (ou la mention de non-assujettissement à la TVA), et ses modalités de paiement ;',
            'ses propres conditions d’annulation ;',
            'le médiateur de la consommation dont il relève ;',
            'sa zone d’intervention et ses disponibilités.',
        ],
    },
    {
        heading: '',
        paragraphs: [
            'Ces informations sont fournies par le Diagnostiqueur, qui en garantit l’exactitude.',
            '5.3. Vérifications effectuées par DPECERT. Avant de référencer un Diagnostiqueur, puis [à chaque échéance de certification ou d’assurance et au moins une fois par an], DPECERT vérifie les justificatifs d’identité, d’immatriculation, de certification et d’assurance. Lorsque cela est possible, DPECERT consulte l’annuaire officiel des diagnostiqueurs immobiliers certifiés. En cas de document manquant, expiré ou incohérent, DPECERT suspend la fiche du Diagnostiqueur. Ces vérifications sont réalisées avec diligence. Elles ne constituent ni une certification, ni une garantie de la qualité du Diagnostic. Vous pouvez vérifier vous-même la certification d’un Diagnostiqueur dans l’annuaire officiel.',
            '5.4. Classement des offres. Les Diagnostiqueurs présentés en réponse à votre recherche sont sélectionnés et classés selon les principaux paramètres suivants, par ordre d’importance décroissante : [1) la couverture de l’adresse du bien par la zone d’intervention et la proximité géographique ; 2) l’adéquation du domaine de certification au Diagnostic demandé ; 3) la disponibilité au créneau recherché ; 4) la fiabilité du Diagnostiqueur, appréciée notamment d’après son délai de réponse, ses acceptations, ses annulations et les prestations réalisées ; 5) les avis des Utilisateurs ; 6) le Prix du Diagnostic, lorsque vous choisissez un tri par prix]. Seuls les Diagnostiqueurs dont la certification et l’assurance ont pu être vérifiées sont présentés. Vous pouvez modifier le classement à l’aide des filtres et options de tri proposés. Lorsque DPECERT fait évoluer ces paramètres, la présente rubrique est mise à jour.',
            '5.5. Prix du Service DPECERT. Les Frais de plateforme s’élèvent à [●] € TTC par Réservation [ou : mode de calcul]. Aucun autre frais n’est facturé par DPECERT.',
            '5.6. Paiement. Les Frais de plateforme sont encaissés par DPECERT via le Prestataire de paiement. Le Prix du Diagnostic est payé directement au Diagnostiqueur ; DPECERT n’intervient pas dans cette transaction.',
            '5.7. Assurances et garanties. DPECERT ne propose aucune assurance ni garantie portant sur le Diagnostic. Le Diagnostiqueur est tenu de disposer d’une assurance de responsabilité civile professionnelle.',
            '5.8. Règlement des litiges. Les modalités de règlement des litiges et le rôle de DPECERT sont décrits aux articles 19 à 21.',
        ],
    },
    {
        heading: 'Article 6 — Accès à la Plateforme et Compte',
        paragraphs: [
            '6.1. La consultation de la Plateforme est gratuite. Les frais de connexion restent à votre charge.',
            '6.2. La création d’un Compte est nécessaire pour effectuer une Réservation. Elle est réservée aux personnes physiques majeures juridiquement capables.',
            '6.3. Vous vous engagez à fournir des informations exactes et à jour. Vos identifiants sont personnels et confidentiels. Informez sans délai DPECERT de toute utilisation non autorisée de votre Compte.',
            '6.4. Vous pouvez supprimer votre Compte à tout moment, sans frais ni motif, depuis la rubrique [« Mon compte — Supprimer mon compte »]. La suppression n’affecte pas les Réservations en cours, qui restent soumises aux articles 10 à 13.',
            '6.5. DPECERT met en œuvre les moyens raisonnables pour assurer l’accès à la Plateforme. L’accès peut être interrompu pour maintenance, mise à jour ou raison de sécurité. DPECERT s’efforce d’en informer les Utilisateurs à l’avance lorsque cela est possible.',
        ],
    },
    {
        heading: 'Article 7 — Réserver un Diagnostiqueur',
        paragraphs: ['7.1. Pour réserver, vous :'],
        bullets: [
            'renseignez les caractéristiques du bien (adresse, type, surface, année de construction, usage) ;',
            'consultez la liste des Diagnostiqueurs disponibles et leurs fiches ;',
            'sélectionnez un Diagnostiqueur et un créneau et, le cas échéant, prenez connaissance de son devis ;',
            'consultez le récapitulatif, qui indique : l’identité du Diagnostiqueur, les caractéristiques essentielles du Diagnostic, le Prix du Diagnostic TTC (ou, lorsqu’il ne peut raisonnablement être calculé à l’avance, son mode de calcul) et ses modalités de paiement, les Frais de plateforme TTC, le coût total, la date du rendez-vous, les conditions d’annulation, l’existence du droit de rétractation et l’emplacement de la fonctionnalité de rétractation ;',
            'vérifiez votre Réservation et corrigez, le cas échéant, les erreurs de saisie ;',
            'acceptez les CGU et les conditions du Diagnostiqueur ;',
            'si le rendez-vous a lieu avant la fin du délai de rétractation, cochez la case de demande expresse prévue à l’article 10.4 ;',
            'cliquez sur le bouton « Commande avec obligation de paiement » ;',
            'payez les Frais de plateforme.',
        ],
    },
    {
        heading: '',
        paragraphs: [
            '7.2. Votre demande est transmise au Diagnostiqueur, qui l’accepte ou la refuse. La Réservation n’est confirmée que lorsque (i) le Prestataire de paiement a confirmé le paiement des Frais de plateforme et (ii) le Diagnostiqueur a accepté la demande via la Plateforme. Un paiement refusé ou en attente ne vaut pas confirmation.',
            '7.3. Si le Diagnostiqueur refuse la demande ou n’y répond pas dans un délai de [24] heures, aucun contrat n’est conclu. DPECERT vous en informe, [annule l’autorisation de paiement ou] vous rembourse intégralement les Frais de plateforme, et peut vous proposer un autre Diagnostiqueur.',
            '7.4. À la confirmation, le contrat relatif au Service DPECERT est conclu entre vous et DPECERT, et le Contrat de Diagnostic est conclu entre vous et le Diagnostiqueur.',
            '7.5. Vous recevez sans délai un e-mail de confirmation reprenant les informations du récapitulatif, les CGU, les conditions du Diagnostiqueur, le formulaire de rétractation et un lien vers la fonctionnalité de rétractation.',
            '7.6. Les informations que vous fournissez sur le bien déterminent le Prix du Diagnostic et le déroulement de la visite. Si le Diagnostiqueur constate que ces informations sont inexactes et propose un prix différent, il doit recueillir votre accord préalable. À défaut d’accord, vous pouvez annuler la Réservation sans frais et les Frais de plateforme vous sont remboursés.',
        ],
    },
    {
        heading: 'Article 8 — Prix',
        paragraphs: [
            '8.1. Prix du Diagnostic. Le Diagnostiqueur fixe librement le Prix du Diagnostic. Avant toute Réservation, ce prix vous est communiqué toutes taxes comprises (ou avec la mention de non-assujettissement à la TVA), frais de déplacement inclus, sous la forme d’un prix affiché ou d’un devis. Lorsque le prix ne peut raisonnablement être calculé à l’avance, son mode de calcul vous est indiqué. DPECERT ne fixe ni ne modifie ce prix.',
            '8.2. Frais de plateforme. Les Frais de plateforme constituent le prix du Service DPECERT. Ils sont affichés séparément, toutes taxes comprises, avant toute Réservation. Ils ne constituent ni un acompte ni des arrhes sur le Prix du Diagnostic, et ne rémunèrent pas le Diagnostiqueur.',
            '8.3. Coût total. Le récapitulatif indique le coût total de la Réservation : Prix du Diagnostic (ou son mode de calcul) et Frais de plateforme.',
            '8.4. Les prix applicables sont ceux affichés au moment de la confirmation de la Réservation. Aucun frais non indiqué dans le récapitulatif ne peut vous être réclamé.',
        ],
    },
    {
        heading: 'Article 9 — Paiement',
        paragraphs: [
            '9.1. Les Frais de plateforme sont payables en ligne lors de la Réservation, par [carte bancaire / autres moyens], via [NOM DU PRESTATAIRE DE PAIEMENT], [statut et autorité d’agrément].',
            '9.2. Vos données de paiement sont traitées par le Prestataire de paiement. DPECERT n’y a pas accès. Le paiement peut nécessiter une authentification forte.',
            '9.3. Le Prix du Diagnostic est payé directement au Diagnostiqueur, selon les modalités indiquées sur sa fiche et dans le récapitulatif. DPECERT ne collecte, ne détient et ne transfère jamais le Prix du Diagnostic.',
            '9.4. Vigilance. DPECERT ne vous demandera jamais de lui verser le Prix du Diagnostic, ni de payer sur un compte autre que celui du Diagnostiqueur figurant sur sa facture. Signalez-nous toute demande de ce type.',
            '9.5. DPECERT vous délivre une facture pour les Frais de plateforme. Le Diagnostiqueur vous délivre sa propre facture pour le Diagnostic.',
            '9.6. DPECERT ou le Prestataire de paiement peuvent examiner, suspendre ou refuser une transaction, ou différer la confirmation ou la transmission d’une Réservation pendant le temps strictement nécessaire à une vérification, en cas de motif raisonnable de soupçonner une fraude, une usurpation d’identité, une utilisation illicite, un usage abusif de la contestation de paiement ou un risque de sécurité. Vous en êtes informé. Ces mesures ne portent pas atteinte à vos droits légaux, notamment à votre droit de contester une opération de paiement.',
        ],
    },
    {
        heading: 'Article 10 — Droit de rétractation',
        paragraphs: [
            '10.1. Principe. Vous disposez d’un délai de quatorze (14) jours à compter de la confirmation de la Réservation pour vous rétracter du Service DPECERT et du Contrat de Diagnostic, sans avoir à motiver votre décision ni à supporter d’autres coûts que ceux prévus à l’article 10.6.',
            '10.2. Comment vous rétracter. Vous pouvez exercer votre droit de rétractation, avant l’expiration du délai :',
        ],
        bullets: [
            'en ligne et gratuitement, via la fonctionnalité « Renoncer au contrat ici », accessible pendant toute la durée du délai depuis [votre Compte, la page de la Réservation et le lien figurant dans l’e-mail de confirmation]. Après avoir validé votre déclaration via le bouton « Confirmer la rétractation », vous recevez un accusé de réception sur support durable indiquant le contenu de votre déclaration ainsi que sa date et son heure d’envoi ;',
            'en envoyant le formulaire figurant en Annexe 1 ;',
            'par toute autre déclaration dénuée d’ambiguïté, adressée à [adresse e-mail] ou [adresse postale].',
        ],
    },
    {
        heading: '',
        paragraphs: [
            '10.3. Portée. Sauf indication contraire de votre part, votre rétractation vaut pour le Service DPECERT et pour le Contrat de Diagnostic. DPECERT la transmet sans délai au Diagnostiqueur. Si vous vous rétractez uniquement du Contrat de Diagnostic avant le rendez-vous, DPECERT vous rembourse également les Frais de plateforme.',
            '10.4. Rendez-vous avant la fin du délai. Si vous souhaitez que le Diagnostic ait lieu avant la fin du délai de rétractation, vous devez en faire la demande expresse en cochant une case distincte lors de la Réservation. Vous reconnaissez alors que vous perdrez votre droit de rétractation une fois le Diagnostic entièrement réalisé. Sans cette demande, aucun rendez-vous ne peut être fixé avant la fin du délai.',
            '10.5. Conséquences pour les Frais de plateforme. Si vous vous rétractez avant la date du Diagnostic, DPECERT vous rembourse l’intégralité des Frais de plateforme. Lorsque le Diagnostic a été entièrement réalisé avant la fin du délai, à la suite de votre demande expresse et de votre reconnaissance de la perte de ce droit, le droit de rétractation ne peut plus être exercé, ni pour le Contrat de Diagnostic ni pour le Service DPECERT (article L. 221-28, 1° du Code de la consommation).',
            '10.6. Conséquences pour le Prix du Diagnostic. Si vous vous rétractez alors que le Diagnostic a commencé à votre demande expresse, le Diagnostiqueur peut vous demander un montant proportionné à la prestation fournie jusqu’à la communication de votre décision, dans les conditions de l’article L. 221-25 du Code de la consommation. Aucune somme n’est due si ces conditions ne sont pas remplies.',
            '10.7. Remboursement. DPECERT rembourse les Frais de plateforme au plus tard quatorze (14) jours après avoir été informé de votre décision, par le moyen de paiement utilisé lors de la Réservation, sauf accord de votre part pour un autre moyen sans frais pour vous. Le Diagnostiqueur rembourse, dans le même délai, toute somme que vous lui auriez versée et qui ne lui est pas due.',
        ],
    },
    {
        heading: 'Article 11 — Modification et annulation par l’Utilisateur',
        paragraphs: [
            'Le présent article s’applique en dehors de l’exercice du droit de rétractation.',
            '11.1. Modification. Vous pouvez modifier le créneau sans frais depuis votre Compte jusqu’à [48] heures avant le rendez-vous, sous réserve des disponibilités du Diagnostiqueur.',
            '11.2. Annulation.',
        ],
        bullets: [
            'Annulation jusqu’à [48] heures avant le rendez-vous : les Frais de plateforme vous sont intégralement remboursés.',
            'Annulation moins de [48] heures avant le rendez-vous, absence au rendez-vous ou impossibilité d’accès au bien qui vous est imputable : le Service DPECERT ayant été fourni, les Frais de plateforme restent acquis à DPECERT.',
        ],
    },
    {
        heading: '',
        paragraphs: ['11.3. Les conséquences de l’annulation sur le Prix du Diagnostic sont régies par les conditions du Diagnostiqueur, portées à votre connaissance avant la Réservation.'],
    },
    {
        heading: 'Article 12 — Annulation par DPECERT ou défaillance du Diagnostiqueur',
        paragraphs: [
            '12.1. Annulation par DPECERT. Si DPECERT annule une Réservation confirmée pour une raison qui ne vous est pas imputable et qui ne relève ni d’un cas de force majeure ni de la défaillance du Diagnostiqueur, DPECERT vous rembourse intégralement les Frais de plateforme et vous verse une indemnité d’un montant égal.',
            '12.2. Défaillance du Diagnostiqueur. Si le Diagnostiqueur annule le rendez-vous, ne se présente pas, se présente avec plus de [60] minutes de retard sans votre accord, ou ne peut plus exercer (notamment en cas de suspension de sa certification), DPECERT vous en informe dès qu’il en a connaissance. Vous choisissez alors :',
        ],
        bullets: [
            'un autre Diagnostiqueur proposé par DPECERT, sans nouveaux Frais de plateforme ; le Prix du Diagnostic du nouveau Diagnostiqueur vous est indiqué avant toute confirmation ; ou',
            'l’annulation de la Réservation, avec remboursement intégral des Frais de plateforme.',
        ],
    },
    {
        heading: '',
        paragraphs: ['12.3. Si vous avez versé tout ou partie du Prix du Diagnostic au Diagnostiqueur défaillant, celui-ci doit vous la rembourser. DPECERT vous assiste dans vos démarches (article 20). Vous conservez tous vos droits à l’égard du Diagnostiqueur.'],
    },
    {
        heading: 'Article 13 — Remboursements',
        paragraphs: [
            '13.1. Sauf délai légal plus court, DPECERT rembourse les Frais de plateforme dus au plus tard quatorze (14) jours après l’événement qui y donne droit, par le moyen de paiement initial, sauf accord de votre part pour un autre moyen sans frais pour vous.',
            '13.2. DPECERT n’encaissant pas le Prix du Diagnostic, son remboursement incombe au Diagnostiqueur.',
            '13.3. Aucune stipulation des CGU ne prive l’Utilisateur d’un droit à remboursement prévu par la loi.',
        ],
    },
    {
        heading: 'Article 14 — Engagements de l’Utilisateur',
        paragraphs: ['14.1. Vous vous engagez à :'],
        bullets: [
            'utiliser la Plateforme conformément à la loi et aux CGU ;',
            'fournir des informations exactes sur le bien et sur votre qualité (propriétaire, ou personne dûment autorisée par celui-ci) ;',
            'permettre au Diagnostiqueur d’accéder à l’ensemble du bien au jour du rendez-vous et lui remettre les documents raisonnablement nécessaires au Diagnostic ;',
            'être présent ou représenté au rendez-vous ;',
            'ne pas demander ni chercher à obtenir une étiquette ou un résultat déterminé, et n’exercer aucune pression sur le Diagnostiqueur ;',
            'traiter le Diagnostiqueur avec respect et garantir sa sécurité lors de la visite ;',
            'ne publier aucun contenu illicite ou trompeur, notamment aucun faux avis ;',
            'ne pas effectuer de Réservation fictive, ni utiliser frauduleusement une procédure de contestation de paiement, notamment pour obtenir un double remboursement ;',
            'ne pas porter atteinte au fonctionnement ou à la sécurité de la Plateforme (extraction automatisée, intrusion, code malveillant).',
        ],
    },
    {
        heading: '',
        paragraphs: ['14.2. Tout manquement peut entraîner les mesures prévues à l’article 24.'],
    },
    {
        heading: 'Article 15 — Engagements des Diagnostiqueurs',
        paragraphs: ['Pour votre information, chaque Diagnostiqueur s’est engagé envers DPECERT à :'],
        bullets: [
            'détenir une certification en cours de validité couvrant le Diagnostic proposé ;',
            'être assuré en responsabilité civile professionnelle ;',
            'respecter les exigences d’indépendance et d’impartialité prévues par l’article L. 271-6 du Code de la construction et de l’habitation ;',
            'réaliser le Diagnostic conformément à la réglementation, le transmettre à l’ADEME lorsque celle-ci l’exige et vous remettre le rapport portant son numéro d’identification ;',
            'vous fournir les informations légales préalables à la conclusion du Contrat de Diagnostic ;',
            'honorer les Réservations confirmées et respecter votre rétractation ;',
            'informer DPECERT sans délai de tout événement affectant sa certification ou son assurance.',
        ],
    },
    {
        heading: '',
        paragraphs: ['Ces engagements lient le Diagnostiqueur. Ils ne constituent pas une garantie de DPECERT sur la qualité du Diagnostic.'],
    },
    {
        heading: 'Article 16 — Responsabilités',
        paragraphs: [
            '16.1. Responsabilité du Diagnostiqueur. Le Diagnostiqueur est seul responsable du Diagnostic : sa réalisation, son contenu, son exactitude, l’étiquette attribuée, les recommandations, la transmission à l’ADEME et le respect des délais. Toute réclamation à ce titre est dirigée contre le Diagnostiqueur et, le cas échéant, son assureur.',
            '16.2. Responsabilité de DPECERT. DPECERT est responsable de la bonne exécution du Service DPECERT, conformément au droit commun et aux dispositions impératives du Code de la consommation. Cela couvre notamment : l’exactitude des informations que DPECERT publie de sa propre initiative, la réalisation diligente des vérifications décrites à l’article 5.3, la gestion des Frais de plateforme, le fonctionnement de la fonctionnalité de rétractation et la protection de vos données personnelles.',
            '16.3. N’étant pas partie au Contrat de Diagnostic, DPECERT n’est pas tenu de son exécution et ne répond pas des fautes professionnelles du Diagnostiqueur, sauf si le dommage résulte d’un manquement de DPECERT à ses propres obligations.',
            '16.4. Les informations des fiches sont fournies par les Diagnostiqueurs. Lorsque DPECERT a connaissance d’une information inexacte, il la fait corriger ou suspend la fiche concernée sans délai.',
            '16.5. La responsabilité de DPECERT ne peut être engagée lorsque le manquement est imputable à l’Utilisateur, au fait imprévisible et insurmontable d’un tiers étranger à la fourniture du Service DPECERT, ou à un cas de force majeure.',
            '16.6. S’agissant de la disponibilité technique de la Plateforme, DPECERT est tenu d’une obligation de moyens.',
            '16.7. Aucune stipulation des CGU n’a pour objet ou pour effet de supprimer ou de réduire votre droit à réparation en cas de manquement de DPECERT à l’une quelconque de ses obligations, ni d’exclure la responsabilité de DPECERT en cas de dommage corporel, de faute lourde ou de faute dolosive.',
        ],
    },
    {
        heading: 'Article 17 — Avis en ligne',
        paragraphs: [
            '17.1. Seuls les Utilisateurs dont le Diagnostic a eu lieu peuvent publier un avis sur le Diagnostiqueur concerné, dans un délai de [●] mois après le rendez-vous. DPECERT vérifie l’existence de la Réservation correspondante avant publication.',
            '17.2. Les avis sont publiés [dans un délai de ● jours], avec leur date et leur note, [par ordre chronologique]. Ils sont conservés en ligne pendant [●]. Aucune contrepartie n’est offerte pour un avis. Les avis négatifs ne sont pas écartés en raison de leur caractère négatif.',
            '17.3. Le Diagnostiqueur peut répondre publiquement à un avis.',
            '17.4. DPECERT peut refuser ou retirer un avis illicite, injurieux, diffamatoire, sans rapport avec le Diagnostic, contenant des données personnelles de tiers, ou rédigé en situation de conflit d’intérêts. L’auteur est informé du refus ou du retrait et de son motif.',
        ],
    },
    {
        heading: 'Article 18 — Contenus, signalements et modération',
        paragraphs: [
            '18.1. Vos contenus. Vous concédez à DPECERT, à titre gratuit et non exclusif, le droit d’héberger, de reproduire et d’afficher vos avis et messages sur la Plateforme, pour les seuls besoins de son fonctionnement et pour la durée de leur publication.',
            '18.2. Contenus interdits. Sont interdits les contenus illicites, diffamatoires, injurieux, discriminatoires, trompeurs, publicitaires ou portant atteinte aux droits de tiers.',
            '18.3. Signaler un contenu. Toute personne peut signaler un contenu qu’elle estime illicite via [le lien « Signaler » présent sur chaque contenu] ou à [adresse e-mail]. Le signalement indique les motifs, l’adresse exacte du contenu, les nom et adresse e-mail de son auteur (sauf exceptions prévues par la loi) et une déclaration de bonne foi. DPECERT accuse réception et informe l’auteur du signalement de sa décision.',
            '18.4. Décisions de modération. DPECERT peut retirer un contenu, en restreindre la visibilité, ou suspendre un Compte. Toute décision est motivée et indique les voies de recours. [DPECERT n’utilise pas d’outil automatisé de modération.] Les outils automatisés servant à présenter ou proposer des Diagnostiqueurs (article 5.4) ne donnent lieu à aucune décision fondée exclusivement sur un traitement automatisé produisant des effets juridiques vous concernant ou vous affectant de manière significative, sauf dans les cas et avec les garanties prévus par le RGPD.',
            '18.5. Contester une décision. Vous pouvez contester gratuitement une décision de modération dans les six (6) mois de sa notification, à [adresse e-mail / formulaire]. Votre réclamation est examinée par une personne, dans un délai raisonnable. Vous conservez le droit de saisir le juge.',
            '18.6. Le Compte d’un Utilisateur qui publie fréquemment des contenus manifestement illicites, ou qui adresse fréquemment des signalements manifestement infondés, peut être suspendu pour une durée raisonnable, après avertissement préalable.',
        ],
    },
    {
        heading: 'Article 19 — Réclamations',
        paragraphs: [
            '19.1. Service DPECERT. Toute réclamation relative au Service DPECERT peut être adressée à [adresse e-mail / formulaire / adresse postale]. DPECERT accuse réception sous [●] jours ouvrés et répond sous [●] jours.',
            '19.2. Diagnostic. Toute réclamation relative au Diagnostic doit d’abord être adressée au Diagnostiqueur, dont les coordonnées figurent dans l’e-mail de confirmation. Cette démarche est sans préjudice de vos droits à l’égard de DPECERT.',
            '19.3. Lorsqu’une réclamation concerne à la fois le Service DPECERT et le Diagnostic, DPECERT et le Diagnostiqueur coopèrent pour la traiter, chacun dans la limite de ses responsabilités.',
        ],
    },
    {
        heading: 'Article 20 — Litige avec un Diagnostiqueur : le rôle de DPECERT',
        paragraphs: [
            '20.1. Un litige portant sur le Diagnostic oppose l’Utilisateur et le Diagnostiqueur. DPECERT n’est ni juge ni arbitre de ce litige et ne prend aucune décision qui s’imposerait aux parties.',
            '20.2. À votre demande, DPECERT peut toutefois : transmettre votre réclamation au Diagnostiqueur ; vous communiquer les informations en sa possession sur la Réservation (date, confirmation, paiement des Frais de plateforme) ; rappeler au Diagnostiqueur ses engagements ; suspendre sa fiche en cas de manquement grave ; vous proposer un autre Diagnostiqueur.',
            '20.3. Cette assistance ne vaut pas reconnaissance de responsabilité de DPECERT ou du Diagnostiqueur.',
            '20.4. Pour un litige relatif au Diagnostic, vous pouvez saisir le médiateur de la consommation dont relève le Diagnostiqueur (indiqué sur sa fiche), signaler les faits à l’organisme ayant certifié le Diagnostiqueur ou à la DGCCRF (SignalConso), ou saisir le juge compétent.',
        ],
    },
    {
        heading: 'Article 21 — Médiation de la consommation',
        paragraphs: [
            '21.1. Si votre réclamation écrite auprès de DPECERT n’a pas abouti, vous pouvez saisir gratuitement le médiateur de la consommation dont relève DPECERT : [NOM DU MÉDIATEUR], [adresse postale], [site internet].',
            '21.2. La saisine doit intervenir dans un délai d’un an à compter de votre réclamation écrite auprès de DPECERT.',
            '21.3. Le recours à la médiation est facultatif. Il n’est pas un préalable obligatoire à la saisine du juge.',
        ],
    },
    {
        heading: 'Article 22 — Propriété intellectuelle',
        paragraphs: [
            '22.1. La Plateforme et ses éléments (marques, logos, textes, graphismes, logiciels, bases de données) sont protégés. DPECERT vous concède un droit personnel, non exclusif et non transférable de les utiliser pour les seuls besoins du Service DPECERT.',
            '22.2. Toute reproduction, extraction ou réutilisation non autorisée, notamment l’extraction de tout ou partie substantielle des bases de données, est interdite.',
            '22.3. Le rapport de Diagnostic est remis par le Diagnostiqueur ; vous pouvez l’utiliser pour toutes les finalités prévues par la réglementation.',
        ],
    },
    {
        heading: 'Article 23 — Données personnelles et cookies',
        paragraphs: [
            '23.1. DPECERT traite vos données personnelles en qualité de responsable de traitement, dans les conditions décrites dans la Politique de confidentialité et de protection des données.',
            '23.2. DPECERT transmet au Diagnostiqueur choisi les seules données raisonnablement nécessaires pour vous identifier, organiser le rendez-vous, communiquer avec vous et réaliser le Diagnostic. Le Diagnostiqueur traite ces données sous sa propre responsabilité, notamment pour établir le Diagnostic et le transmettre à l’ADEME lorsque la réglementation l’exige.',
            '23.3. Vous disposez, dans les conditions prévues par la loi, de droits d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité. Vous pouvez retirer à tout moment un consentement donné et vous opposer à tout moment à la prospection commerciale. Ces droits s’exercent à [adresse e-mail dédiée à la protection des données] ; DPECERT peut vérifier votre identité avant d’y donner suite. Vous pouvez introduire une réclamation auprès de la CNIL.',
            '23.4. Les cookies et autres technologies de traçage sont décrits dans la Politique relative aux cookies et autres technologies de traçage. Les traceurs non strictement nécessaires ne sont activés qu’avec votre consentement, que vous pouvez modifier ou retirer à tout moment via le module de gestion des cookies.',
        ],
    },
    {
        heading: 'Article 24 — Suspension et résiliation',
        paragraphs: [
            '24.1. Par l’Utilisateur. Vous pouvez supprimer votre Compte à tout moment (article 6.4).',
            '24.2. Par DPECERT, sans faute. DPECERT peut mettre fin à votre Compte moyennant un préavis de [trente (30)] jours adressé par e-mail. Les Réservations confirmées sont honorées ou, à défaut, les Frais de plateforme sont remboursés et l’article 12.1 s’applique.',
            '24.3. Pour manquement. En cas de manquement grave aux CGU (fraude, informations fausses, Réservations fictives, comportement menaçant envers un Diagnostiqueur, tentative d’obtenir un résultat déterminé, contenus illicites), DPECERT peut suspendre votre Compte après une mise en demeure restée sans effet pendant [huit (8)] jours. La suspension peut être immédiate en cas d’urgence ou lorsque la gravité du manquement l’impose. La décision est motivée et peut être contestée selon l’article 18.5. Les Frais de plateforme des Réservations non exécutées sont remboursés, sous réserve de tous dommages et intérêts.',
        ],
    },
    {
        heading: 'Article 25 — Force majeure',
        paragraphs: [
            '25.1. Aucune partie n’est responsable d’un manquement causé par un événement de force majeure au sens de l’article 1218 du Code civil.',
            '25.2. Si l’empêchement dépasse [trente (30)] jours, chaque partie peut résilier la Réservation concernée. Les Frais de plateforme correspondant à un service non fourni sont remboursés.',
        ],
    },
    {
        heading: 'Article 26 — Modification des CGU',
        paragraphs: [
            '26.1. DPECERT peut modifier les CGU pour tenir compte d’une évolution légale ou réglementaire, d’un impératif de sécurité ou d’une évolution de la Plateforme. Une modification ne peut altérer les caractéristiques essentielles ou le prix d’une Réservation déjà confirmée.',
            '26.2. Vous êtes informé par e-mail et sur la Plateforme au moins [trente (30)] jours avant l’entrée en vigueur de la modification, sauf obligation légale imposant un délai plus court.',
            '26.3. Si vous n’acceptez pas la modification, vous pouvez supprimer votre Compte sans frais avant son entrée en vigueur. Les nouvelles CGU vous sont soumises pour acceptation lors de votre Réservation suivante.',
            '26.4. Chaque Réservation reste régie par la version des CGU acceptée lors de sa confirmation.',
        ],
    },
    {
        heading: 'Article 27 — Dispositions diverses',
        paragraphs: [
            '27.1. Langue. Les CGU sont rédigées en français. Une traduction en anglais est mise à disposition à titre informatif ; en cas de divergence, la version française prévaut.',
            '27.2. Preuve. Les enregistrements informatiques conservés par DPECERT dans des conditions raisonnables de sécurité peuvent être produits comme preuve des échanges et des Réservations, sauf preuve contraire.',
            '27.3. Archivage. Lorsque le montant de la commande est égal ou supérieur à 120 euros, DPECERT conserve l’écrit constatant le contrat pendant dix ans et vous en garantit l’accès à tout moment (articles L. 213-1 et D. 213-1 du Code de la consommation).',
            '27.4. Nullité partielle. Si une stipulation est déclarée nulle ou réputée non écrite, les autres stipulations demeurent applicables.',
            '27.5. Non-renonciation. Le fait pour DPECERT de ne pas se prévaloir d’une stipulation ne vaut pas renonciation à s’en prévaloir ultérieurement.',
            '27.6. Transfert. DPECERT peut transférer les CGU à une entité reprenant l’exploitation de la Plateforme, à condition que ce transfert ne réduise pas vos droits. Vous en êtes informé et pouvez supprimer votre Compte sans frais.',
        ],
    },
    {
        heading: 'Article 28 — Droit applicable et juridiction',
        paragraphs: [
            '28.1. Les CGU sont soumises au droit français. Ce choix ne vous prive pas de la protection des dispositions impératives de la loi du pays de votre résidence habituelle.',
            '28.2. En cas de litige, nous vous invitons à contacter d’abord notre service client (article 19). Cette démarche est facultative.',
            '28.3. Vous pouvez saisir, à votre choix, la juridiction du lieu où vous demeuriez au moment de la conclusion du contrat ou de la survenance du fait dommageable, ou toute autre juridiction compétente en application de la loi.',
        ],
    },
    {
        heading: 'Annexe 1 — Formulaire de rétractation',
        paragraphs: ['[Insérer le modèle figurant en annexe de l’article R. 221-3 du Code de la consommation, dans sa rédaction en vigueur à la date de publication (modifiée par le décret n° 2026-3 du 5 janvier 2026), complété du nom, de l’adresse postale et de l’adresse e-mail de DPECERT.]'],
    },
];

const FranceTerms = () => (
    <LegalDoc
        seoTitle="Conditions Générales d'Utilisation et de Service"
        seoDesc="Conditions générales d'utilisation et de service de la plateforme DPECERT — www.dpecert.fr"
        canonical="/terms"
        badge="CGU"
        title="Conditions générales d'utilisation et de service de la plateforme DPECERT"
        subtitle="Version en vigueur — Site : www.dpecert.fr"
        notice={
            <>
                Une traduction anglaise est disponible à titre informatif :{' '}
                <Link to="/terms-english" className="font-bold underline hover:text-blue-700">Read the English version (information only)</Link>.
                En cas de divergence, la présente version française prévaut.
            </>
        }
        callout={{
            title: "L'essentiel en bref",
            bullets: [
                'DPECERT est une plateforme de mise en relation. DPECERT ne réalise pas les diagnostics : chaque diagnostic de performance énergétique (DPE) est réalisé par le diagnostiqueur indépendant que vous choisissez, sous sa seule responsabilité professionnelle.',
                'Vous concluez deux contrats distincts : un contrat avec DPECERT pour le service de la plateforme, et un contrat avec le diagnostiqueur pour le diagnostic.',
                'Vous payez en ligne à DPECERT des Frais de plateforme. Le prix du diagnostic est payé directement au diagnostiqueur. DPECERT ne l’encaisse jamais.',
                'Vous disposez d’un droit de rétractation de 14 jours, exerçable en ligne via le bouton « Renoncer au contrat ici » (article 10).',
                'En cas de difficulté, contactez notre service client ; vous pouvez ensuite saisir gratuitement un médiateur de la consommation (articles 19 à 21).',
            ],
            text: 'Ce résumé ne remplace pas les articles ci-dessous, qui seuls font foi.',
        }}
        sections={sections}
    />
);

export default FranceTerms;
