'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export default function DateRangePicker() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const defaultFrom = searchParams.get('from') || '';
    const defaultTo = searchParams.get('to') || '';

    const [from, setFrom] = useState(defaultFrom);
    const [to, setTo] = useState(defaultTo);
    const [preset, setPreset] = useState('30d');

    const setDates = (fromStr: string, toStr: string, presetName: string) => {
        setFrom(fromStr);
        setTo(toStr);
        setPreset(presetName);
        
        const params = new URLSearchParams(searchParams.toString());
        params.set('from', fromStr);
        params.set('to', toStr);
        router.push(`${pathname}?${params.toString()}`);
    };

    const handlePresetChange = (value: string) => {
        const now = new Date();
        const getStr = (d: Date) => d.toISOString().split('T')[0];

        if (value === 'today') {
            setDates(getStr(now), getStr(now), 'today');
        } else if (value === 'yesterday') {
            const yest = new Date(now);
            yest.setDate(now.getDate() - 1);
            setDates(getStr(yest), getStr(yest), 'yesterday');
        } else if (value === '7d') {
            const seven = new Date(now);
            seven.setDate(now.getDate() - 6);
            setDates(getStr(seven), getStr(now), '7d');
        } else if (value === '30d') {
            const thirty = new Date(now);
            thirty.setDate(now.getDate() - 29);
            setDates(getStr(thirty), getStr(now), '30d');
        } else if (value === 'month') {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            setDates(getStr(start), getStr(now), 'month');
        } else {
            setPreset('custom');
        }
    };

    // Установка пресета 30 дней по умолчанию, если параметры в URL отсутствуют
    useEffect(() => {
        if (!defaultFrom || !defaultTo) {
            // Calculate 30d without triggering a state cascade during render
            const newTo = new Date();
            const newFrom = new Date();
            newFrom.setDate(newFrom.getDate() - 30);

            const fromStr = newFrom.toISOString().split('T')[0];
            const toStr = newTo.toISOString().split('T')[0];

            const currentParams = new URLSearchParams(searchParams.toString());
            currentParams.set('from', fromStr);
            currentParams.set('to', toStr);
            router.push(`${pathname}?${currentParams.toString()}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultFrom, defaultTo]);

    // Update state to match URL params if they exist and are different
    if (defaultFrom && defaultTo && (defaultFrom !== from || defaultTo !== to)) {
        setFrom(defaultFrom);
        setTo(defaultTo);
        setPreset('custom');
    }

    return (
        <div className="flex gap-2 items-center bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm hover:border-slate-300 transition-colors">
            <Calendar size={16} className="text-slate-400 ml-2" />
            <select 
                value={preset} 
                onChange={(e) => handlePresetChange(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-slate-700 pr-2 border-none appearance-none"
            >
                <option value="today" className="bg-white text-slate-900">Сегодня</option>
                <option value="yesterday" className="bg-white text-slate-900">Вчера</option>
                <option value="7d" className="bg-white text-slate-900">Последние 7 дней</option>
                <option value="30d" className="bg-white text-slate-900">Последние 30 дней</option>
                <option value="month" className="bg-white text-slate-900">Этот месяц</option>
                <option value="custom" className="bg-white text-slate-900">Свой период</option>
            </select>
            
            {preset === 'custom' && (
                <div className="flex items-center gap-2 border-l border-slate-200 pl-2 ml-1 animation-fade-in">
                    <input 
                        type="date" 
                        value={from} 
                        onChange={(e) => setDates(e.target.value, to, 'custom')}
                        className="bg-transparent text-xs text-slate-600 focus:outline-none cursor-pointer"
                    />
                    <span className="text-slate-400 text-xs font-medium">до</span>
                    <input 
                        type="date" 
                        value={to} 
                        onChange={(e) => setDates(from, e.target.value, 'custom')}
                        className="bg-transparent text-xs text-slate-600 focus:outline-none cursor-pointer"
                    />
                </div>
            )}
        </div>
    );
}
