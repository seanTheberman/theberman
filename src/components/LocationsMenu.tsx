import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { getTenantFromDomain } from '../lib/tenant'

interface County {
    id: string
    name: string
    slug: string
}

interface Province {
    id: string
    name: string
    slug: string
    counties: County[]
}

const IRELAND_LOCATIONS: Province[] = [
    {
        id: 'leinster',
        name: 'Leinster',
        slug: 'leinster',
        counties: [
            { id: 'dublin', name: 'Dublin', slug: 'dublin' },
            { id: 'louth', name: 'Louth', slug: 'louth' },
            { id: 'meath', name: 'Meath', slug: 'meath' },
            { id: 'wicklow', name: 'Wicklow', slug: 'wicklow' },
            { id: 'wexford', name: 'Wexford', slug: 'wexford' },
            { id: 'kildare', name: 'Kildare', slug: 'kildare' },
            { id: 'carlow', name: 'Carlow', slug: 'carlow' },
            { id: 'kilkenny', name: 'Kilkenny', slug: 'kilkenny' },
            { id: 'laois', name: 'Laois', slug: 'laois' },
            { id: 'offaly', name: 'Offaly', slug: 'offaly' },
            { id: 'westmeath', name: 'Westmeath', slug: 'westmeath' },
            { id: 'longford', name: 'Longford', slug: 'longford' }
        ]
    },
    {
        id: 'connacht',
        name: 'Connacht',
        slug: 'connacht',
        counties: [
            { id: 'galway', name: 'Galway', slug: 'galway' },
            { id: 'mayo', name: 'Mayo', slug: 'mayo' },
            { id: 'sligo', name: 'Sligo', slug: 'sligo' },
            { id: 'leitrim', name: 'Leitrim', slug: 'leitrim' },
            { id: 'roscommon', name: 'Roscommon', slug: 'roscommon' }
        ]
    },
    {
        id: 'munster',
        name: 'Munster',
        slug: 'munster',
        counties: [
            { id: 'cork', name: 'Cork', slug: 'cork' },
            { id: 'kerry', name: 'Kerry', slug: 'kerry' },
            { id: 'clare', name: 'Clare', slug: 'clare' },
            { id: 'waterford', name: 'Waterford', slug: 'waterford' },
            { id: 'limerick', name: 'Limerick', slug: 'limerick' },
            { id: 'tipperary', name: 'Tipperary', slug: 'tipperary' }
        ]
    },
    {
        id: 'ulster',
        name: 'Ulster',
        slug: 'ulster',
        counties: [
            { id: 'donegal', name: 'Donegal', slug: 'donegal' },
            { id: 'cavan', name: 'Cavan', slug: 'cavan' },
            { id: 'monaghan', name: 'Monaghan', slug: 'monaghan' },
            { id: 'antrim', name: 'Antrim', slug: 'antrim' },
            { id: 'armagh', name: 'Armagh', slug: 'armagh' },
            { id: 'down', name: 'Down', slug: 'down' },
            { id: 'fermanagh', name: 'Fermanagh', slug: 'fermanagh' },
            { id: 'derry', name: 'Londonderry', slug: 'londonderry' },
            { id: 'tyrone', name: 'Tyrone', slug: 'tyrone' }
        ]
    }
];

const SPAIN_LOCATIONS: Province[] = [
    {
        id: 'comunidad-madrid',
        name: 'Comunidad de Madrid',
        slug: 'comunidad-madrid',
        counties: [{ id: 'madrid', name: 'Madrid', slug: 'madrid' }]
    },
    {
        id: 'cataluna',
        name: 'Cataluña',
        slug: 'cataluna',
        counties: [{ id: 'barcelona', name: 'Barcelona', slug: 'barcelona' }]
    },
    {
        id: 'comunidad-valenciana',
        name: 'Comunidad Valenciana',
        slug: 'comunidad-valenciana',
        counties: [{ id: 'valencia', name: 'Valencia', slug: 'valencia' }]
    },
    {
        id: 'andalucia',
        name: 'Andalucía',
        slug: 'andalucia',
        counties: [
            { id: 'sevilla', name: 'Sevilla', slug: 'sevilla' },
            { id: 'malaga', name: 'Málaga', slug: 'malaga' }
        ]
    },
    {
        id: 'pais-vasco',
        name: 'País Vasco',
        slug: 'pais-vasco',
        counties: [{ id: 'bilbao', name: 'Bilbao', slug: 'bilbao' }]
    },
    {
        id: 'islas-baleares',
        name: 'Islas Baleares',
        slug: 'islas-baleares',
        counties: [{ id: 'palma', name: 'Palma', slug: 'palma' }]
    },
    {
        id: 'islas-canarias',
        name: 'Islas Canarias',
        slug: 'islas-canarias',
        counties: [{ id: 'las-palmas', name: 'Las Palmas', slug: 'las-palmas' }]
    },
    {
        id: 'aragon',
        name: 'Aragón',
        slug: 'aragon',
        counties: [{ id: 'zaragoza', name: 'Zaragoza', slug: 'zaragoza' }]
    },
    {
        id: 'murcia',
        name: 'Murcia',
        slug: 'murcia',
        counties: [{ id: 'murcia-city', name: 'Murcia', slug: 'murcia' }]
    }
];

const ENGLAND_LOCATIONS: Province[] = [
    {
        id: 'greater-london',
        name: 'Greater London',
        slug: 'greater-london',
        counties: [{ id: 'london', name: 'London', slug: 'london' }]
    },
    {
        id: 'south-east',
        name: 'South East',
        slug: 'south-east',
        counties: [
            { id: 'brighton', name: 'Brighton', slug: 'brighton' },
            { id: 'southampton', name: 'Southampton', slug: 'southampton' }
        ]
    },
    {
        id: 'west-midlands',
        name: 'West Midlands',
        slug: 'west-midlands',
        counties: [
            { id: 'birmingham', name: 'Birmingham', slug: 'birmingham' },
            { id: 'coventry', name: 'Coventry', slug: 'coventry' }
        ]
    },
    {
        id: 'east-midlands',
        name: 'East Midlands',
        slug: 'east-midlands',
        counties: [
            { id: 'nottingham', name: 'Nottingham', slug: 'nottingham' },
            { id: 'leicester', name: 'Leicester', slug: 'leicester' }
        ]
    },
    {
        id: 'north-west',
        name: 'North West',
        slug: 'north-west',
        counties: [
            { id: 'manchester', name: 'Manchester', slug: 'manchester' },
            { id: 'liverpool', name: 'Liverpool', slug: 'liverpool' },
            { id: 'leeds', name: 'Leeds', slug: 'leeds' }
        ]
    },
    {
        id: 'north-east',
        name: 'North East',
        slug: 'north-east',
        counties: [
            { id: 'newcastle', name: 'Newcastle', slug: 'newcastle' },
            { id: 'york', name: 'York', slug: 'york' }
        ]
    },
    {
        id: 'south-west',
        name: 'South West',
        slug: 'south-west',
        counties: [
            { id: 'bristol', name: 'Bristol', slug: 'bristol' },
            { id: 'bath', name: 'Bath', slug: 'bath' },
            { id: 'exeter', name: 'Exeter', slug: 'exeter' },
            { id: 'plymouth', name: 'Plymouth', slug: 'plymouth' },
            { id: 'southampton', name: 'Southampton', slug: 'southampton' },
            { id: 'brighton', name: 'Brighton', slug: 'brighton' }
        ]
    }
];

export default function LocationsMenu({ open }: { open: boolean }) {
    const tenant = getTenantFromDomain();
    const locations = tenant === 'england' ? ENGLAND_LOCATIONS : (tenant === 'spain' ? SPAIN_LOCATIONS : IRELAND_LOCATIONS);
    const regionLabel = tenant === 'england' ? 'Region' : (tenant === 'spain' ? 'Comunidad' : 'Province');
    const [activeProvince, setActiveProvince] = useState<Province | null>(locations[0])

    if (!open) return null

    return (
        <div className="fixed left-6 top-20 z-50">
            <div className="relative flex bg-white rounded-xl shadow-xl border overflow-hidden">

                {/* Provinces */}
                <div className="w-64 py-3 bg-gray-50 border-r border-gray-100">
                    {locations.map((province) => (
                        <div
                            key={province.id}
                            onMouseEnter={() => setActiveProvince(province)}
                            className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-all
                ${activeProvince?.id === province.id
                                    ? "text-[#007F00] bg-[#007F00]/5 font-bold border-r-2 border-[#007F00]"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}
              `}
                        >
                            <span>{province.name}</span>
                            <ChevronRight size={16} className={activeProvince?.id === province.id ? "translate-x-1 transition-transform" : ""} />
                        </div>
                    ))}
                </div>

                {/* Counties panel */}
                {activeProvince && (
                    <div className="w-72 bg-white py-4 max-h-[80vh] overflow-y-auto shadow-inner">
                        <div className="px-6 mb-3 flex justify-between items-center">
                            <span
                                className="text-xs font-black text-[#007F00] uppercase tracking-widest cursor-default"
                            >
                                {activeProvince.name} {regionLabel}
                            </span>
                        </div>
                        <div className="space-y-0.5">
                            {activeProvince.counties.map((county) => (
                                <Link
                                    key={county.id}
                                    to={`/${county.slug}`}
                                    className="block px-6 py-2.5 text-gray-700 hover:bg-[#007F00]/10 hover:text-[#007F00] transition-colors font-medium border-l-2 border-transparent hover:border-[#007F00]"
                                >
                                    {county.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
