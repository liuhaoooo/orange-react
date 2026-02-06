
import React, { useState } from 'react';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { FileText } from 'lucide-react';
import ledInfoOdu from '../assets/ledInfo_ODU.png';
import ledInfoIdu from '../assets/ledInfo_IDU.png';

type HelpContentGenerator = string | ((lang: string) => string);

const PLMN_HELP_CONTENT: Record<string, HelpContentGenerator> = {
    "65202": `
              <p>Customer service:</p>
              <p>Call 136 7am-11pm (toll free) from any Orange mobile while in Botswana OR 72000136 from any network (chargeable)</p>
              <p>Email: customerservice@orange.com</p>
              <p>Mail: Private Bag BO 64, Gaborone, Botswana</p>
              `,
    "61302": `
              <p>For All Customers:</p>
              <p>Call 121 or by what's up 66082222</p>
               </br>
              <p>For more info,visit <a target="_blank" href="http://www.Orange.bf" > www.Orange.bf</a></p>
              `,
    "62402": `
                <p>Composez le 8900</p>
                <p>Ou appelez le 696400400 (appel payant 100frs/min)</p>
                <p>Courriel : supportinternet@orange.com</p>
                </br>
                <p>Dial 8900</p>
                <p>Or dial 696400400 (cost 100frs/min)</p>
                <p>Email : supportinternet@orange.com</p>
              `,
    "60201": `
              <p>For Personal Customers:</p>
              <p>Call 110 from any Orange number</p>
              <p>Call 16110 from any landline</p>
                </br>
              <p>For Enterprise Customers:</p>
              <p>Call 250 from any Orange number</p>
                </br>
              <p>For more info, visit <a target="_blank" href="http://www.Orange.eg" >www.Orange.eg</a></p>
              `,
    "61101": `
              <p>Service client : 6277</p>
              <p>Le service client est accessible par un numéro court : le 6277 (appel payant)</p>
              <p>ou au  00224 62 77 00 00 à l’international (appel facturé à linternational)</p>
              <p>Email Service Client Orange : serviceclientogn@orange-sonatel.com</p>
              `,
    "61203": `
              <p>'Le service Clients est disponible 7j/7 de 7h00 à 22h00 pour le grand public et de 7h00 à 20h00 pour les entreprises.</p>
              </br>
              <p>Pour le grand public appelez au:</p>
              <p>• 0707 à partir du mobile</p>
              <p>• 21230707 à partir du fixe</p>
              </br>
              <p>Pour les entreprises appelez au: </p>
              <p>• 0808 à partir du mobile</p>
              <p>• 21230808 à partir du fixe</p>
              `,
    "61807": `
              <p>For Personal Customers:</p>
              <p>Call 111 from any Orange number</p>
              <p>Call 077700011 from any network</p>
              </br>
              <p>For Enterprise Customers:</p>
              <p>Call 222 from any Orange number</p>
              </br>
              <p>For more info, visit <a target="_blank" href="http://www.Orange.com.lr" >www.Orange.com.lr</a></p>
              `,
    "64602": `
              <p>Pour contacter le service client composez le  204 à partir de votre téléphone</p>
              `,
    "61002": `
              <p>Service client Grand publique </p>
              <p>N° Court 7400</p>
              <p>N° long 44 99 94 00</p>
              <p>----------------------------------------</p>
              <p>Service Client Enterprise</p>
              <p>N° Court 7414</p>
              <p>N° long 44 99 94 14</p>
              <p>----------------------------------------</p>
              <p>For more info, visit <a target="_blank" href="http://www.Orangemali.com" >www.Orangemali.com</a></p>
              `,
    "62303": `
              <p>For all Customers:</p>
              <p>Call 800 from any Orange number</p>
              </br>
              <p>For Enterprise Customers:</p>
              <p>Call 812 from any Orange number     Call 72271010</p>
              </br>
              <p>For more info, visit <a target="_blank" href="http://www.orangerca.com/" >www.orangerca.com/</a></p>

              `,
    "63086": `
              <p>Service client accessible 24h/24 et 7j/7</p>
              <p>1777.</p>
              <p>Envoie d'une requete au service client via le site wb orange.cd  :  <a target="_blank" href="http://www.orange.cd/info/contactez-nous.php" >www.orange.cd/info/contactez-nous.php</a></p>
              `,
    "63089": `
              <p>Service client accessible 24h/24 et 7j/7</p>
              <p>1777.</p>
              <p>Envoie d'une requete au service client via le site wb orange.cd  :  <a target="_blank" href="http://www.orange.cd/info/contactez-nous.php" >www.orange.cd/info/contactez-nous.php</a></p>
              `,
    "60801": `
              <p>Pour plus d'informations, merci de contacter le service client au 1441 ou</p> 
              <p>Visiter notre page Facebook  <a target="_blank" href="https://web.facebook.com/orange.sn/" >web.facebook.com/orange.sn/</a></p>
              <p>Visiter notre compte Twitter  <a target="_blank" href="https://twitter.com/SupportOrange" >twitter.com/SupportOrange</a></p>
              <p>Visiter notre forum d’assistance  <a target="_blank" href="https://assistance.orange.sn/" >assistance.orange.sn/</a></p>
              <p>Par mail : serviceclient@orange-sonatel.com</p>
              `,
    "61901": `
              <p>For  Inquiries,</p>
              <p>Visit Any Orange Shop across the country or Call 121</p>
              <p>For More Information</p>
              <p>visit <a target="_blank" href="http://www.oange.sl" >www.oange.sl</a></p> 
              `,
    "20801": `
                <p>Service clients mobile : </p> 
                <p>Contactez le 3900 depuis votre mobile ou depuis une ligne Orange (service gratuit + prix de l’appel)</p> 

                <p>Service clients mobile</p> 
                <p>706 (tapez 1)   24H/24   7j /7  - depuis un mobile (appel décompté de votre forfait voix)</p> 
                <p>0825 000 706    24H/24   7j /7 - depuis un poste fixe (0,13€ HT/min)</p> 
                <p>+33 675 052 000 - depuis l'international</p> 
              `,
    "22610": `
              <p>For support on data services:</p> 
              <p>- dial 408 from an Orange Romania number </p> 
              <p>- dial 021 203 30 31 from other phone numbers outside Orange network</p> 
              </br>
              <p><a target="_blank" href="http://www.orange.ro/help" >www.orange.ro/help</a></p>
              `,
    "27099": `
                <p>Service Clients : </p> 
                <p>Ouvert 6 jours sur 7 du lundi au vendredi de 08h00 à 20h00 et le samedi de 08h00 à 17h00. </p> 
                <p>Téléphone: </p> 
                <p>Appel gratuit en national au 800 61 606  </p> 
                <p>Depuis l’international +352 661 061 606 </p> 
                <p>Courrier: </p> 
                <p>Orange Communications Luxembourg SA </p> 
                <p>8 rue des Mérovingiens </p> 
                <p>L-8070 Bertrange  </p> 
                <p>eMail : </p> 
                <p>clients@orangeluxembourg.lu </p> 
              `,
    "25901": `
            <p>Pentru informatii aditionale contactati serviciul clienti - 777 sau +37322977777</p> 
              `,
    "26003": `
              <p>pomoc techniczna Orange Ekspert: *900 (z telefonu Orange)</p> 
                <p>Biuro Obsługi Klienta Biznesowego: *600 (z telefonu Orange) lub +48 510 600 600</p> 
                    <p>Biuro Obsługi Klienta: *100 (z telefonu Orange) lub +48 510 100 100</p> 
              `,
    "23101": `
            <p>Zákaznícka linka 905</p> 
            <p>0905 905 905</p> 

                <p>Orange Slovensko, a.s.</p> 
                    <p>Metodova 8</p> 
                        <p>821 08 Bratislava</p> 
                            <p><a target="_blank" href="http://www.orange.sk" >www.orange.sk</a></p> 
              `,
    "23103": `
            <p>Zákaznícka linka 905</p> 
            <p>0905 905 905</p> 

            <p>Orange Slovensko, a.s.</p> 
            <p>Metodova 8</p> 
            <p>821 08 Bratislava</p> 
            <p><a target="_blank" href="http://www.orange.sk" >www.orange.sk</a></p> 
              `,
    "21403": `
            <p>ayuda y soporte: </p> 
            <p>1470 particulares, 1471 autónomos y empresas</p>
                <p><a target="_blank" href="https://ayuda.orange.es" >ayuda.orange.es</a></p> 
              `,
    "64700": `
            <p>Service clients mobile : 
                <p>Contactez le 3900 depuis votre mobile ou depuis une ligne Orange (service gratuit + prix de l’appel)</p> 
              `,
    "21421": `
            <p>ayuda y soporte: </p>
                <p>1565</p>

                    <p><a target="_blank" href="https://ayuda.jazztel.com/" >ayuda.jazztel.com/</a> </p>
              `,
    "34001": `
                <p>Service clients mobile : </p> 
                <p>Contactez le 3900 depuis votre mobile ou depuis une ligne Orange (service gratuit + prix de l’appel)</p> 

                <p>Service clients mobile</p> 
                <p>706 (tapez 1)   24H/24   7j /7  - depuis un mobile (appel décompté de votre forfait voix)</p> 
                <p>0825 000 706    24H/24   7j /7 - depuis un poste fixe (0,13€ HT/min)</p> 
                <p>+33 675 052 000 - depuis l'international</p> 
              `,
    "63203": (lang) => {
        if (lang === 'fr') {
            return `<p>
            Pour contacter le service client Orange Internet, appelez le 500 ou
            rendez-vous sur
            <a target="_blank" href="http://www.orange-bissau.com">
              www.orange-bissau.com
            </a>
            .
          </p>`;
        }
        if (lang === 'po') {
            return `<p>
            Para contactar o serviço ao cliente Orange Internet, ligue 500 ou
            visite
            <a target="_blank" href="http://www.orange-bissau.com">
              www.orange-bissau.com
            </a>
            .
          </p>`;
        }
        return `<p>
            To contact Orange customer service, please call 500 or go to
            <a target="_blank" href="http://www.orange-bissau.com">
              www.orange-bissau.com
            </a>
            .
          </p>`;
    },
    "41677": (lang) => {
        if (lang === 'ar') {
            return `<p>
            لمزيد من المعلومات يرجى الاتصال على 1777 أو 0777700177 لمشتركي
            الشبكات الاخرى، أو زيارة أحد معارض أورانج. ايضا يمكنك زيارة موقعنا
            الالكتروني
            <a target="_blank" href="http://www.orange.jo">www.orange.jo</a>
          </p>`;
        }
        return `<p>
            For more information, please call 1777 or 0777 700 177 from other
            networks. Visit any of our shops or our Website
            <a target="_blank" href="http://www.orange.jo">www.orange.jo</a>
          </p>`;
    },
    "60400": (lang) => {
        if (lang === 'ar') {
            return `<p>
            يمكنكم الإتصال بخدمة الزبناء Orange على الرقم 121 من رقم Orange او
            121 121 63 06 من شبكة أخرى.
          </p>`;
        }
        return `<p>
            Pour contacter le Centre de Relation Client Orange, appelez le 121
            depuis un numéro Orange ou le 06 63 121 121 depuis un autre
            opérateur.
          </p>`;
    },
    "60501": (lang) => {
        if (lang === 'en') {
            return `<p>
            <label>Customer service available 24/24 and 7/7</label>
            <label>1150 (free from your Orange mobile)</label>
            <label>31 11 11 50 from a landline or mobile</label>
            <label>
              Access to your dedicated area
              <a target="_blank" href="http://www.orange.tn/moncompte">
                www.orange.tn/moncompte
              </a>
            </label>
          </p>`;
        }
        return `<p>
            <label>Service client accessible 24h/24 et 7j/7</label>
            <label>1150 (gratuit depuis votre mobile Orange)</label>
            <label>31 11 11 50 depuis une ligne fixe ou mobile</label>
            <label>
              Accès à votre espace dédié :
              <a target="_blank" href="http://www.orange.tn/moncompte">
                www.orange.tn/moncompte
              </a>
            </label>
          </p>`;
    },
    "63201": (lang) => {
        if (lang === 'fr') {
            return `<p>
            Pour contacter le service client Orange Internet, appelez le 500 ou
            rendez-vous sur
            <a target="_blank" href="https://www.orange-bissau.com">
              www.orange-bissau.com
            </a>
          </p>`;
        }
        if (lang === 'po') {
            return `<p>
            Para contactar o serviço ao cliente Orange Internet, ligue 500 ou
            visite
            <a target="_blank" href="https://www.orange-bissau.com">
              www.orange-bissau.com
            </a>
          </p>`;
        }
        return `<p>
            To contact Orange customer service, please call 500 or go to
            <a target="_blank" href="https://www.orange-bissau.com">
              www.orange-bissau.com
            </a>
          </p>`;
    }
};

export const HelpPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { globalData } = useGlobalState();
  const statusInfo = globalData.statusInfo || {};
  const connectionSettings = globalData.connectionSettings || {};
  
  const [activeTab, setActiveTab] = useState<'info' | 'faq' | 'led'>('info');

  const getNetworkStatusText = () => {
    if (statusInfo.network_status === "1") return t('connected');
    return t('notConnected');
  };

  // Determine Help & Support Text based on PLMN
  const plmn = statusInfo.PLMN || '';
  const currentLang = connectionSettings.language || language;
  
  const contentOrFunc = PLMN_HELP_CONTENT[plmn];
  let helpContent = '';
  
  if (typeof contentOrFunc === 'function') {
      helpContent = contentOrFunc(currentLang);
  } else if (contentOrFunc) {
      helpContent = contentOrFunc;
  }

  // Determine User Guide Link
  const userGuideUrl = connectionSettings.userguide_link || "http://customer.cwmpd.com/customer/ORANGE/Flybox_5G_CP06_User_Manual.pdf";

  return (
    <div className="w-full">
      {/* Header Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-3 font-bold text-sm border-b-4 transition-colors ${
            activeTab === 'info'
              ? 'text-orange border-orange'
              : 'text-black border-transparent hover:border-gray-200'
          }`}
        >
          {t('usefulInformation')}
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-3 font-bold text-sm border-b-4 transition-colors ${
            activeTab === 'faq'
              ? 'text-orange border-orange'
              : 'text-black border-transparent hover:border-gray-200'
          }`}
        >
          {t('faq')}
        </button>
        <button
          onClick={() => setActiveTab('led')}
          className={`px-4 py-3 font-bold text-sm border-b-4 transition-colors ${
            activeTab === 'led'
              ? 'text-orange border-orange'
              : 'text-black border-transparent hover:border-gray-200'
          }`}
        >
          {t('ledInfo')}
        </button>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* My Information Section */}
            <div className="bg-white border border-gray-300 p-6">
              <h2 className="text-lg font-bold text-black mb-4">{t('myInformation')}</h2>
              
              <div className="mb-4">
                <a href="https://neva.orange.com/privacyMBB" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline text-sm hover:text-blue-800">
                  {t('personalDataNotice')}
                </a>
              </div>

              <div className="space-y-3 text-sm text-black">
                <div className="flex">
                  <span className="text-gray-500 w-32 shrink-0">{t('phoneNumber')} :</span>
                  <span className="font-medium">{statusInfo.device_msisdn || ''}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32 shrink-0">{t('model')} :</span>
                  <span className="font-medium">{connectionSettings.device_module || ''}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32 shrink-0">{t('firmware')} :</span>
                  <span className="font-medium">{connectionSettings.version || ''}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32 shrink-0">{t('type')} :</span>
                  <span className="font-medium">{connectionSettings.build_type || ''}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32 shrink-0">{t('apn')} :</span>
                  <span className="font-medium">{statusInfo.apn_name || ''}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32 shrink-0">{t('networkStatus')} :</span>
                  <span className="font-medium">{getNetworkStatusText()}</span>
                </div>
              </div>
            </div>

            {/* Help & Support Section */}
            <div className="bg-white border border-gray-300 p-6">
              <h2 className="text-lg font-bold text-black mb-2">{t('helpSupport')}</h2>
              
              {helpContent ? (
                  <div className="text-gray-500 text-sm mb-4 leading-relaxed [&>p]:mb-1 [&_a]:text-blue-600 [&_a]:underline [&_label]:block" dangerouslySetInnerHTML={{ __html: helpContent }} />
              ) : (
                  <p className="text-gray-500 text-sm mb-4">
                    <a target="_blank" href="http://www.orange.be" className="text-blue-600 underline hover:text-blue-800">
                      http://www.orange.be
                    </a>
                  </p>
              )}
              
              <div className="flex items-center">
                 <FileText className="w-5 h-5 text-black me-2" />
                 <a href={userGuideUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline text-sm hover:text-blue-800">
                   {t('userGuide')}
                 </a>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'faq' && (
          <div className="bg-gray-200 border border-gray-300 h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
             {/* Simulating a PDF Viewer container */}
             <div className="bg-white p-10 shadow-lg max-w-2xl w-full h-[90%] overflow-y-auto">
                <h1 className="text-3xl font-bold text-orange mb-2">Airbox 4G</h1>
                <h2 className="text-xl font-bold text-gray-700 mb-6">(U10E)</h2>
                <h2 className="text-2xl font-bold text-gray-500 mb-10">Quick Start Guide</h2>
                
                <div className="flex justify-center mb-10">
                   <div className="w-64 h-40 bg-black rounded-3xl flex items-center justify-center relative border-4 border-gray-800">
                        {/* Device Graphic Mockup */}
                        <div className="text-gray-600 text-xs">Device Image</div>
                   </div>
                </div>
                
                <div className="flex justify-between items-end mt-20">
                    <div className="w-8 h-8 bg-orange text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div className="bg-orange text-white px-2 py-1 font-bold text-xs">orange</div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'led' && (
          <div className="space-y-6">
            {/* ODU Card */}
            <div className="bg-white border border-gray-300 p-6 shadow-sm">
                <h3 className="font-bold text-black text-center mb-6">ODU LED Info</h3>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-auto shrink-0 flex justify-center">
                        <img src={ledInfoOdu} alt="ODU LED" className="max-h-[300px] w-auto object-contain" />
                    </div>
                    <div className="flex-1 w-full overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm border-collapse border border-gray-200">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="border border-gray-200 p-3 font-medium">Ordinal</th>
                                    <th className="border border-gray-200 p-3 font-medium">Indicator</th>
                                    <th className="border border-gray-200 p-3 font-medium">State</th>
                                    <th className="border border-gray-200 p-3 font-medium">Description</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600">
                                {/* 1. Power */}
                                <tr>
                                    <td rowSpan={2} className="border border-gray-200 p-3 align-middle">1</td>
                                    <td rowSpan={2} className="border border-gray-200 p-3 align-middle">Power</td>
                                    <td className="border border-gray-200 p-3">On</td>
                                    <td className="border border-gray-200 p-3">The device is powered normally</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-200 p-3">Off</td>
                                    <td className="border border-gray-200 p-3">The device is not supplying power properly</td>
                                </tr>
                                {/* 2. 4G Status */}
                                <tr>
                                    <td rowSpan={2} className="border border-gray-200 p-3 align-middle">2</td>
                                    <td rowSpan={2} className="border border-gray-200 p-3 align-middle">4G Status</td>
                                    <td className="border border-gray-200 p-3">On</td>
                                    <td className="border border-gray-200 p-3">The device is connected to 4G network</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-200 p-3">Off</td>
                                    <td className="border border-gray-200 p-3">The device is not connected to 4G network</td>
                                </tr>
                                {/* 3. 5G Status */}
                                <tr>
                                    <td rowSpan={2} className="border border-gray-200 p-3 align-middle">3</td>
                                    <td rowSpan={2} className="border border-gray-200 p-3 align-middle">5G Status</td>
                                    <td className="border border-gray-200 p-3">On</td>
                                    <td className="border border-gray-200 p-3">The device is connected to 5G network</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-200 p-3">Off</td>
                                    <td className="border border-gray-200 p-3">The device is not connected to 5G network</td>
                                </tr>
                                {/* 4. Signal Strength */}
                                <tr>
                                    <td rowSpan={4} className="border border-gray-200 p-3 align-middle">4</td>
                                    <td rowSpan={4} className="border border-gray-200 p-3 align-middle">Signal strength</td>
                                    <td className="border border-gray-200 p-3">Red</td>
                                    <td className="border border-gray-200 p-3">Weak signal quality</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-200 p-3">Yellow</td>
                                    <td className="border border-gray-200 p-3">Medium signal quality</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-200 p-3">Green</td>
                                    <td className="border border-gray-200 p-3">Excellent signal quality</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-200 p-3">Off</td>
                                    <td className="border border-gray-200 p-3">No signal</td>
                                </tr>
                                {/* 5. ETH */}
                                <tr>
                                    <td rowSpan={3} className="border border-gray-200 p-3 align-middle">5</td>
                                    <td rowSpan={3} className="border border-gray-200 p-3 align-middle">ETH</td>
                                    <td className="border border-gray-200 p-3">On</td>
                                    <td className="border border-gray-200 p-3">The network port connection is normal</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-200 p-3">Flashing</td>
                                    <td className="border border-gray-200 p-3">Network port data is being transmitted</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-200 p-3">Off</td>
                                    <td className="border border-gray-200 p-3">The network port is not connected</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* IDU Card */}
            <div className="bg-white border border-gray-300 p-6 shadow-sm">
                <h3 className="font-bold text-black text-center mb-6">IDU LED Info</h3>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-auto shrink-0 flex justify-center">
                        <img src={ledInfoIdu} alt="IDU LED" className="max-h-[300px] w-auto object-contain" />
                    </div>
                    <div className="flex-1 w-full overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm border-collapse border border-gray-200">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="border border-gray-200 p-3 font-medium">Indicator Type</th>
                                    <th className="border border-gray-200 p-3 font-medium">Description</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600">
                                <tr>
                                    <td className="border border-gray-200 p-3">Blue (Flashing)</td>
                                    <td className="border border-gray-200 p-3">Start MESH network</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-200 p-3">Blue (Bright)</td>
                                    <td className="border border-gray-200 p-3">MESH network is running</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-200 p-3">Green (Bright)</td>
                                    <td className="border border-gray-200 p-3">Normal working condition</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-200 p-3">Red (Flashing)</td>
                                    <td className="border border-gray-200 p-3">MESH network timeout or failure</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-200 p-3">White (Flashing)</td>
                                    <td className="border border-gray-200 p-3">Restored to factory settings or in the process of upgrading</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
