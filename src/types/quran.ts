export interface Verse {
    id: number;
    verseNumber: number;
    verseKey: string;
    arabic: string;
    english: string;
    turkish: {
        omer_nasuhi_bilmen: string;
        hayrat_nesriyat: string;
        diyanet_vakfi: string;
    };
    audio: {
        ghamadi: string;
    };
}

export interface SurahData {
    verses: Verse[];
    tafseer?: {
        elmalili?: string;
    };
}
