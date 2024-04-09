/*
 *
 * * Bearbeiten
 * Diese Datei darf nur von Vorstandsmitgliedern des Vereins Zurich meets Tanzania verändert werden.
 * 
 * * Wegleitung zum Bearbeiten
 * Grundsätzlich können alle Daten ganz normal ersetzt oder ausgetauscht werden.
 * Titel müssen am Anfang immer ein <h1> und am Ende ein </h1>.
 * Untertitel genau gleich, aber mit einem <h2> und </h2>.
 * Normaler Text befindet sich in <p> und </p>.
 * Es gibt allerdings einige Ausnahmen:
 * - Die Zeichen < und > müssen als &lt; und &gt; geschrieben werden. (Ausser schon bestehende)
 * - Es keine Absätze gemacht werden, falls der Text trotzdem welche braucht kann dafür ein <br> verwendet werden.
 * - Wenn ein Gänsefüsschen benutzt werden möchte muss davor ein \ kommen, also: \"
 * - Falls ein \ benutzt werden möchte, müssen zwei davon geschrieben werden, also: \\
 * 
 * ! Die Änderungen sind erst nach einem Neustart des Servers live
 * 
 * 
*/
const STATUTEN = [
    "<h1>Rechtsform, Zweck und Sitz</h1>",
    "<h2>Art. 1</h2>",
    "<p>Unter dem Namen «zurich – meets – tanzania», besteht ein Verein gemäss den vorliegenden Statuten und im Sinne von Artikel 60 ff. des Schweizerischen Zivilgesetzbuches.</p>",
    "<h2>Art. 2</h2>",
    "<p>Der Verein bezweckt die Organisation und Erbringung von Hilfeleistungen in der Region Mbeya/Ifisi im südlichen Tanzania. Im Vordergrund stehen da Hilfeleistungen medizinischer Natur für das Spital Ifisi und Hilfeleistungen für Schulprojekte in Songwe.<br>Spendengelder werden eingesetzt für die Organisation von medizinischer Infrastruktur, Schulmaterialen und für die Aus- und Weiterbildung von örtlichem Personal.<br>Der Verein verfolgt keine kommerziellen Zwecke und erstrebt keinen Gewinn.</p>",
    "<h2>Art. 3</h2>",
    "<p>Der Sitz des Vereins befindet sich in Zürich. Der Verein besteht auf unbeschränkte Dauer.</p>",
    "<h1>Mitgliedschaft</h1>",
    "<h2>Art. 4</h2>",
    "<p>Die Mitgliedschaft steht allen natürlichen und juristischen Personen offen, die ein Interesse an der Erreichung der Vereinszwecke (vgl. Art. 2) haben.<br>Im Rahmen der ihm zur Verfügung stehenden Möglichkeiten und Mittel betreibt der Verein eine Webseite und zieht die Herausgabe/Veröffentlichung eines Newsletters für die Mitglieder des Vereins sowie für interessierte Dritte in Betracht.</p>",
    "<h2>Art. 5</h2>",
    "<p>Der Vorstand entscheidet über die Aufnahme neuer Mitglieder und informiert die Generalversammlung darüber.</p>",
    "<h2>Art. 6</h2>",
    "<p>Die Mitgliedschaft erlischt durch:<br>a) den Austritt (schriftlich zuhanden des Vorstands; der Mitgliederbeitrag für das laufende Jahr muss immer bezahlt werden)<br>b) den Ausschluss aus «wichtigen Gründen»<br>c) Todesfall bei natürlichen Personen, Verlust der Rechtsfähigkeit bei juristischen Personen</p>",
    "<p>Verantwortlich für den Ausschluss ist der Vorstand. Die betroffene Person kann gegen diesen Entscheid bei der Generalversammlung Beschwerde einlegen. Werden die Mitgliederbeiträge wiederholt (während zwei Jahren) nicht bezahlt, führt dies zum Ausschluss aus dem Verein.</p>",
    "<h1>Organe</h1>",
    "<h2>Art. 7</h2>",
    "<p>Die Organe des Vereins sind:<br>A. die Generalversammlung;<br>B. der Vorstand<br>C. die Revisionsstelle</p>",
    "<h2>Art. 8</h2>",
    "<p>Die Generalversammlung bildet das oberste Organ des Vereins. Sie besteht aus allen Mitgliedern des Vereins.</p>",
    "<h2>Art. 9</h2>",
    "<p>Die Generalversammlung ist für folgende Aufgaben zuständig:<br>a) Genehmigung des Protokolls der letzten Generalversammlung;<br>b) Festsetzung des Jahresbudgets und der jährlichen Mitgliederbeitrage;<br>c) Abnahme des Jahresberichts, der Jahresrechnung und des Berichts der Revisionsstelle;<br>d) Entlastung der Vorstandsmitglieder und der Revisionsstelle;<br>e) Wahl des Präsidenten / der Präsidentin, der übrigen Vorstandsmitglieder und der Revisionsstelle;<br>f) Behandlung von Anträgen des Vorstands und der Mitglieder;<br>g) Änderung der Statuten;<br>h) Auflösung des Vereins.</p>",
    "<h2>Art. 10</h2>",
    "<p>Die Generalversammlung wird vom Vorstand mindestens 20 Tage im Voraus einberufen. Der Vorstand kann falls nötig eine ausserordentliche Generalversammlung einberufen.</p>",
    "<h2>Art. 11</h2>",
    "<p>Die Generalversammlung wird vom Präsidenten/von der Präsidentin des Vorstands oder von einem anderen Vorstandsmitglied geleitet.</p>",
    "<h2>Art. 12</h2>",
    "<p>Beschlüsse der Generalversammlung werden mit einfachem Mehr der anwesenden Mitglieder gefasst.<br>Bei Stimmengleichheit gibt der/die Vorsitzende den Stichentscheid.</p>",
    "<h2>Art. 13</h2>",
    "<p>Die Stimmabgabe erfolgt durch Handerheben. Wenn mindestens fünf Mitglieder dies beantragen, erfolgt die Abstimmung geheim. Eine Stimmabgabe durch Stellvertretung ist nicht möglich.</p>",
    "<h2>Art. 14</h2>",
    "<p>Die Generalversammlung tritt mindestens einmal jährlich nach Einberufung durch den Vorstand zusammen.</p>",
    "<h2>Art. 15</h2>",
    "<p>Der Vorstand muss jeden von einem Mitglied mindestens 10 Tage im Voraus schriftlich eingereichten Vorschlag auf die Tagesordnung jeder (ordentlichen oder ausserordentlichen) Generalversammlung aufnehmen.</p>",
    "<h2>Art. 16</h2>",
    "<p>Eine ausserordentliche Generalversammlung findet auf Einberufung des Vorstands oder auf Verlangen von einem Fünftel der Mitglieder statt.</p>",
    "<h2>Art. 17</h2>",
    "<p>Der Vorstand setzt sich zusammen aus:<br>A. Präsident/in<br>B. Sekretär/in<br>C. Kassier/in<br>D. maximal 3 Beisitzer<br>Ämterkumulation ist zulässig.</p>",
    "<h2>Art. 18</h2>",
    "<p>Der Vorstand ist für die Umsetzung und Ausführung der Beschlüsse der Generalversammlung zuständig. Er leitet den Verein und ergreift alle nötigen Massnahmen, um den Vereinszweck zu erreichen. Der Vorstand ist zuständig in allen Angelegenheiten, die nicht ausdrücklich der Generalversammlung vorbehalten sind.<br>Ihm obliegen insbesondere:<br>a) Vorbereitung und Durchführung der ordentlichen und ausserordentlichen Generalversammlung;<br>b) Erlass von Reglementen;<br>c) Aufnahme und Ausschluss von Mitgliedern;<br>d) Buchführung<br>e) Einstellung (Entlassung) der bezahlten und der freiwilligen Mitarbeitenden des Vereins<br><br>Die Mitglieder des Vorstandes sind ehrenamtlich tätig und haben grundsätzlich nur Anspruch auf Entschädigung ihrer effektiven Spesen und Barauslagen. Für besondere Leistungen einzelner Vorstandsmitglieder kann eine angemessene Entschädigung ausgerichtet werden.</p>",
    "<h2>Art. 19</h2>",
    "<p>Der Vorstand besteht aus mindestens zwei Mitgliedern, die jeweils für zwei Jahre von der Generalversammlung gewählt werden. Der Vorstand konstituiert sich selbst. Der Vorstand trifft sich so oft, wie es die Geschäfte des Vereins erfordern.</p>",
    "<h2>Art. 20</h2>",
    "<p>Der Verein wird durch die Kollektivunterschrift von zwei Vorstandsmitgliedern verpflichtet.</p>",
    "<h2>Art. 21</h2>",
    "<p>Die Revisionsstelle überprüft die Buchführung des Vereins und legt der Generalversammlung einen Bericht vor. Sie besteht aus einem von der Generalversammlung gewählten Revisor bzw. einer Revisorin. Das Geschäftsjahr beginnt jeweils am 1. Januar und endet am 31. Dezember.</p>",
    "<h1>Vereinsvermögen und Haftung</h1>",
    "<h2>Art. 22</h2>",
    "<p>Die Mittel des Vereins bestehen aus den ordentlichen und ausserordentlichen Mitgliederbeiträgen, Schenkungen oder Vermächtnissen, dem Erlös aus Vereinsaktivitäten und gegebenenfalls aus Subventionen von öffentlichen Stellen.</p>",
    "<h2>Art. 23</h2>",
    "<p>Für die Verbindlichkeiten des Vereins wird mit dem Vereinsvermögen gehaftet; eine persönliche Haftung der Mitglieder ist ausgeschlossen.</p>",
    "<h1>Statutenänderung und Auflösung</h1>",
    "<h2>Art. 24</h2>",
    "<p>Für eine Statutenänderung oder die Auflösung des Vereins sind die Anwesenheit von mindestens drei Vierteln aller Mitglieder sowie die absolute Mehrheit der abgegebenen Stimmen erforderlich.<br>Wird eines der Quoren nicht erreicht, ist innerhalb von vier Wochen eine zweite Generalversammlung mit den gleichen Traktanden einzuberufen. Diese ist ohne Rücksicht auf die Zahl der Mitglieder beschlussfähig.</p>",
    "<h2>Art. 25</h2>",
    "<p>Die Auflösung des Vereins wird von der Generalversammlung beschlossen und erfordert eine Zweidrittelsmehrheit der anwesenden Mitglieder.</p>",
    "<h2>Art. 26</h2>",
    "<p>Eine Fusion kann nur mit einer anderen wegen Gemeinnützigkeit oder öffentlichen Zwecks von der Steuerpflicht befreiten juristischen Person mit Sitz in der Schweiz erfolgen.<br>Im Falle einer Auflösung werden Gewinn und Kapital einer anderen wegen Gemeinnützigkeit oder öffentlichen Zwecks steuerbefreiten juristischen Person mit Sitz in der Schweiz zugewendet. Deren Zwecksetzung muss gleich oder ähnlich sein. Eine Verteilung unter die Mitglieder ist ausgeschlossen.</p>",
    "<p>Diese Statuten wurden von der Gründungsversammlung am 23.04.2017 in Zürich angenommen und in Kraft gesetzt.</p>",
    "<p>Der Präsident: Stefan Christen<br><br>Der Sekretär: Christoph Schubert</p>"
];



export default STATUTEN;