export interface PlmnServiceItem {
  id: string;
  label: string;
  ussd_code?: string;
  subcmd?: string;
  url?: string;
}

export const getServicesByPlmn = (plmn: string): PlmnServiceItem[] => {
  if (plmn === '41677') {
    return [];
  }

  if (plmn === '60801') {
    return [
      { id: '1', label: 'buy an internet pass', ussd_code: '#1234#' },
      { id: '2', label: 'check your balance', ussd_code: '#123#' },
      { id: '3', label: 'transfer the credit', ussd_code: '#116#' },
      { id: '4', label: 'Orange Money', ussd_code: '#144#' },
    ];
  }

  if (plmn === '60501') {
    return [
      { id: '1', label: 'Recharge with a scratch card', ussd_code: '*141*1#' },
      { id: '2', label: 'Buy a pass or an Internet option', ussd_code: '*141*2#' },
      { id: '3', label: 'Track my consumption', ussd_code: '*141*3#' },
      { id: '4', label: 'Recharge with bank card', ussd_code: '*141*4#' },
      { id: '5', label: 'Recharge with e-dinar card', ussd_code: '*141*5#' },
      { id: '6', label: 'My number', ussd_code: '*123#' },
    ];
  }

  if (plmn === '20801') {
    return [
      { id: '1', label: 'Detailed Balance in France', ussd_code: '#123*1#' },
      { id: '2', label: 'Detailed Balance Worldwide', ussd_code: '#123*3#' },
      { id: '3', label: 'Subscribe to Pass or Option offers', ussd_code: '#123*2*1#' },
      { id: '4', label: 'Top up my account', ussd_code: '#123*1*1#' },
    ];
  }

  if (plmn === '64602') {
    return [
      { id: '1', label: 'Orange Money', ussd_code: '#144#' },
      { id: '2', label: 'e-Zara', ussd_code: '#232#' },
      { id: '3', label: 'portail service Orange', ussd_code: '#123#' },
      { id: '4', label: 'Buy an internet pass', url: 'http://123.orange.mg/AchatForfait/menu/BeConnect' },
      { id: '5', label: 'Our offers', url: 'https://www.orange.mg/' },
      { id: '6', label: 'Personal offers Internet', url: 'https://www.orange.mg/particuliers/' },
    ];
  }

  if (plmn === '65202') {
    return [
      { id: '1', label: 'Check Balance', ussd_code: '*121*4*1#' },
      { id: '2', label: 'Top Up', ussd_code: '*121*4*1#' },
      { id: '3', label: 'Buy Bundles', ussd_code: '*121*2#' },
    ];
  }

  if (plmn === '61302') {
    return [
      { id: '1', label: 'My Balance', ussd_code: '*160#' },
      { id: '2', label: 'Buy an internet pass', ussd_code: '*103#' },
      { id: '3', label: 'share my bundle', ussd_code: '*303#' },
      { id: '4', label: 'Buy Night Pass', ussd_code: '*506#' },
    ];
  }

  if (plmn === '62402') {
    return [
      { id: '1', label: 'Balance', ussd_code: '#123#' },
      { id: '2', label: 'Buy your pass', ussd_code: '#145#' },
      { id: '3', label: 'Take ya own', ussd_code: '#131*5#' },
      { id: '4', label: 'Orange Money', ussd_code: '#150#' },
    ];
  }

  if (plmn === '60201') {
    return [
      { id: '1', label: '#100# Menu', ussd_code: '#100#' },
      { id: '2', label: 'My line number', ussd_code: '#119#' },
    ];
  }

  if (plmn === '63203') {
    return [
      { id: '1', label: 'My Balance', ussd_code: '#123#' },
      { id: '2', label: 'Buy an internet pass', ussd_code: '#5234#' },
      { id: '3', label: 'Nha Orange', ussd_code: '#511#' },
      { id: '4', label: 'Emergency data', ussd_code: '#519#' },
    ];
  }

  if (plmn === '61101') {
    return [
      { id: '1', label: 'Recharge', ussd_code: '*123#' },
      { id: '2', label: 'Usage info', ussd_code: '*124#' },
      { id: '3', label: 'Buy an internet pass', ussd_code: '*222#' },
      { id: '4', label: 'P2P transfer', ussd_code: '*126#' },
      { id: '5', label: 'My number', ussd_code: '*145#' },
    ];
  }

  if (plmn === '61203') {
    return [
      { id: '1', label: 'Credit information', ussd_code: '#111*2#' },
      { id: '2', label: 'Buy a Data Bundle', ussd_code: '#111*1#' },
      { id: '3', label: 'Data usage', ussd_code: '#111*2*2#' },
      { id: '4', label: 'Emergency services', ussd_code: '#170#' },
      { id: '5', label: 'My number', ussd_code: '#99#' },
    ];
  }

  if (plmn === '61807') {
    return [
      { id: '1', label: 'My Balance', ussd_code: '*124#' },
      { id: '2', label: 'Fast Top Up', ussd_code: '*497#' },
      { id: '3', label: 'Buy My Pack', ussd_code: '*352#' },
    ];
  }

  if (plmn === '61002') {
    return [
      { id: '1', label: 'Recharge by card', ussd_code: '#101#11#' },
      { id: '2', label: 'Buy a pass', ussd_code: '#101#211#' },
      { id: '3', label: 'Credit transfer', ussd_code: '#101#12#' },
      { id: '4', label: 'Orange Fidelité', ussd_code: '#101#5#' },
    ];
  }

  if (plmn === '62303') {
    return [
      { id: '1', label: 'My Balance', ussd_code: '#123#' },
    ];
  }

  if (plmn === '63086' || plmn === '63089') {
    return [
      { id: '1', label: 'Flybox Portal', ussd_code: '*816#' },
      { id: '2', label: 'Main balance', ussd_code: '*211#' },
      { id: '3', label: 'Bonus and subscription balance', ussd_code: '*125#' },
    ];
  }

  if (plmn === '61901') {
    return [
      { id: '1', label: 'My Balance', ussd_code: '*137*8#' },
      { id: '2', label: 'Buy Data', ussd_code: '*800#' },
      { id: '3', label: 'Orange Money', ussd_code: '*500#' },
      { id: '4', label: 'My Orange Menu', ussd_code: '*121#' },
    ];
  }

  // Default
  return [
    { id: '1', label: 'Check Airtime Balance', ussd_code: '*310#' },
    { id: '2', label: 'Check my balance', ussd_code: '*461*4#' },
    { id: '3', label: 'Check My Number', subcmd: '4' },
  ];
};
