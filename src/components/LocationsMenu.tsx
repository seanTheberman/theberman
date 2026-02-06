import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

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
            { id: 'monaghan', name: 'Monaghan', slug: 'monaghan' }
        ]
    }
];

export default function LocationsMenu({ open }: { open: boolean }) {
    const [activeProvince, setActiveProvince] = useState<Province | null>(IRELAND_LOCATIONS[0])

    if (!open) return null

    return (
        <div className="fixed left-6 top-20 z-50">
            <div className="relative flex bg-white rounded-xl shadow-xl border overflow-hidden">

                {/* Provinces */}
                <div className="w-64 py-3 bg-gray-50 border-r border-gray-100">
                    {IRELAND_LOCATIONS.map((province) => (
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
                    <div className="w-72 bg-white py-4 max-h-[70vh] overflow-y-auto">
                        <div className="px-6 mb-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{activeProvince.name} Counties</h3>
                        </div>
                        {activeProvince.counties.map((county) => (
                            <Link
                                key={county.id}
                                to={`/county/${county.slug}`}
                                className="block px-6 py-2.5 text-gray-700 hover:bg-[#007F00]/10 hover:text-[#007F00] transition-colors font-medium border-l-2 border-transparent hover:border-[#007F00]"
                            >
                                {county.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
