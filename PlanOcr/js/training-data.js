// Nigerian Survey Plan Training Examples
const surveyPlanExamples = [
    {
        text: `- PLAN SHEWING PROPERTY - SAID TO BELONG TO - PATIENCE OBEHI ADUDU -
               - OF FAGBAMIYE SEUN STREET, ORINYANRIN VIA MOWE-
               - OBAFEMI/OWODE LOCAL GOVERNMENT AREA- - OGUN - STATE -
               - SCALE : - 1:500 - - ORIGIN:- U.T.M (ZONE 31) -
               - AREA:- 462.151 SQ.MTS - 74955.594mN OG/5093/2025/053
               ALLI BAZEET D., mnis SURVEYOR DATE:- 17 - 09 - 2025`,
        expected: {
            title: "PATIENCE OBEHI ADUDU",
            address: {
                full: "FAGBAMIYE SEUN STREET, ORINYANRIN VIA MOWE, OBAFEMI/OWODE LOCAL GOVERNMENT AREA, OGUN STATE",
                street: "FAGBAMIYE SEUN STREET",
                area: "ORINYANRIN",
                lga: "OBAFEMI/OWODE",
                state: "OGUN",
                via: "MOWE"
            },
            scale: "1:500",
            area: {
                value: 462.151,
                unit: "square meters",
                inAcres: "0.1142"
            },
            coordinates: {
                origin: "U.T.M (ZONE 31)",
                zone: "31",
                datum: "UTM",
                northing: 74955.594,
                combined: "74955.594mN (Zone 31) [UTM]"
            },
            planNumber: "OG/5093/2025/053",
            surveyor: "ALLI BAZEET D., mnis SURVEYOR",
            date: "17-09-2025"
        }
    },
    {
        text: `SURVEY PLAN OF PROPERTY OWNED BY CHIEF ADEBAYO ADEGOKE
               SITUATED AT PLOT 15, ADEOLA ODUTOLA STREET, IKEJA
               LAGOS STATE, SCALE 1:1000, AREA: 1250.50 SQ.M
               COORDINATES: 658423.15mE, 851234.75mN
               PLAN NO: LA/2024/0567/AB
               SURVEYED BY: ENGR. MUSA IBRAHIM, mnis
               DATE: 15-MARCH-2024`,
        expected: {
            title: "CHIEF ADEBAYO ADEGOKE",
            address: {
                full: "PLOT 15, ADEOLA ODUTOLA STREET, IKEJA, LAGOS STATE",
                street: "ADEOLA ODUTOLA STREET",
                area: "IKEJA",
                state: "LAGOS"
            },
            scale: "1:1000",
            area: {
                value: 1250.50,
                unit: "square meters",
                inAcres: "0.3090"
            },
            coordinates: {
                easting: 658423.15,
                northing: 851234.75,
                combined: "658423.150mE, 851234.750mN"
            },
            planNumber: "LA/2024/0567/AB",
            surveyor: "ENGR. MUSA IBRAHIM, mnis",
            date: "15-MARCH-2024"
        }
    }
];

// Export for use in parser training
if (typeof window !== 'undefined') {
    window.surveyPlanExamples = surveyPlanExamples;
}