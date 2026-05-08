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
        id: 'central',
        name: 'Centro',
        slug: 'centro',
        counties: [
            { id: 'madrid', name: 'Madrid', slug: 'madrid' },
            { id: 'toledo', name: 'Toledo', slug: 'toledo' },
            { id: 'guadalajara', name: 'Guadalajara', slug: 'guadalajara' },
            { id: 'ciudad-real', name: 'Ciudad Real', slug: 'ciudad-real' },
            { id: 'cuenca', name: 'Cuenca', slug: 'cuenca' },
            { id: 'albacete', name: 'Albacete', slug: 'albacete' }
        ]
    },
    {
        id: 'cataluna',
        name: 'Cataluña',
        slug: 'cataluna',
        counties: [
            { id: 'barcelona', name: 'Barcelona', slug: 'barcelona' },
            { id: 'tarragona', name: 'Tarragona', slug: 'tarragona' },
            { id: 'girona', name: 'Girona', slug: 'girona' },
            { id: 'lleida', name: 'Lleida', slug: 'lleida' }
        ]
    },
    {
        id: 'andalucia',
        name: 'Andalucía',
        slug: 'andalucia',
        counties: [
            { id: 'sevilla', name: 'Sevilla', slug: 'sevilla' },
            { id: 'malaga', name: 'Málaga', slug: 'malaga' },
            { id: 'granada', name: 'Granada', slug: 'granada' },
            { id: 'cordoba', name: 'Córdoba', slug: 'cordoba' },
            { id: 'cadiz', name: 'Cádiz', slug: 'cadiz' },
            { id: 'jaen', name: 'Jaén', slug: 'jaen' }
        ]
    },
    {
        id: 'valencia',
        name: 'Valencia',
        slug: 'valencia',
        counties: [
            { id: 'valencia-city', name: 'Valencia', slug: 'valencia' },
            { id: 'alicante', name: 'Alicante', slug: 'alicante' },
            { id: 'castellon', name: 'Castellón', slug: 'castellon' }
        ]
    }
];

const ENGLAND_LOCATIONS: Province[] = [
    {
        id: 'london',
        name: 'London & South East',
        slug: 'london-south-east',
        counties: [
            { id: 'london', name: 'London', slug: 'london' },
            { id: 'kent', name: 'Kent', slug: 'kent' },
            { id: 'surrey', name: 'Surrey', slug: 'surrey' },
            { id: 'sussex', name: 'Sussex', slug: 'sussex' },
            { id: 'essex', name: 'Essex', slug: 'essex' },
            { id: 'hertfordshire', name: 'Hertfordshire', slug: 'hertfordshire' }
        ]
    },
    {
        id: 'midlands',
        name: 'Midlands',
        slug: 'midlands',
        counties: [
            { id: 'birmingham', name: 'Birmingham', slug: 'birmingham' },
            { id: 'nottingham', name: 'Nottingham', slug: 'nottingham' },
            { id: 'leicester', name: 'Leicester', slug: 'leicester' },
            { id: 'coventry', name: 'Coventry', slug: 'coventry' },
            { id: 'derby', name: 'Derby', slug: 'derby' },
            { id: 'stoke', name: 'Stoke-on-Trent', slug: 'stoke-on-trent' }
        ]
    },
    {
        id: 'north',
        name: 'North',
        slug: 'north',
        counties: [
            { id: 'manchester', name: 'Manchester', slug: 'manchester' },
            { id: 'liverpool', name: 'Liverpool', slug: 'liverpool' },
            { id: 'leeds', name: 'Leeds', slug: 'leeds' },
            { id: 'sheffield', name: 'Sheffield', slug: 'sheffield' },
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
                            <Link
                                to={`/region?province=${activeProvince.slug}`}
                                className="text-xs font-black text-[#007F00] uppercase tracking-widest hover:underline cursor-pointer"
                            >
                                {activeProvince.name} {regionLabel}
                            </Link>
                        </div>
                        <div className="space-y-0.5">
                            {activeProvince.counties.map((county) => (
                                <Link
                                    key={county.id}
                                    to={`/region?county=${county.slug}`}
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
