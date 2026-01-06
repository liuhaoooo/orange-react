export interface WifiNetwork {
  id: string;
  name: string;
  frequency: '2.4GHz' | '5GHz';
  clients: number;
  hasQr: boolean;
  enabled: boolean;
  isGuest?: boolean;
}

export interface UsageData {
  national: {
    used: number;
    unit: 'GB' | 'MB';
  };
  international: {
    used: number;
    unit: 'GB' | 'MB';
  };
}
