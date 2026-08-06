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
            handlePresetChange('30d');
        } else {
            // Если параметры уже есть в URL, синхронизируем локальный стейт
            setFrom(defaultFrom);
            setTo(defaultTo);
            setPreset('custom'); // По умолчанию кастом, если не совпадает с логикой пресетов
        }
    }, [defaultFrom, defaultTo]);

    return (
        <div className="flex gap-2 items-center bg-slate-900 border border-slate-800 p-1.5 rounded-xl shadow-inner">
            <Calendar size={16} className="text-slate-400 ml-2" />
            <select 
                value={preset} 
                onChange={(e) => handlePresetChange(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-slate-200 pr-2 border-none"
            >
                <option value="today" className="bg-slate-950 text-white">Сегодня</option>
                <option value="yesterday" className="bg-slate-950 text-white">Вчера</option>
                <option value="7d" className="bg-slate-950 text-white">Последние 7 дней</option>
                <option value="30d" className="bg-slate-950 text-white">Последние 30 дней</option>
                <option value="month" className="bg-slate-950 text-white">Этот месяц</option>
                <option value="custom" className="bg-slate-950 text-white">Свой период</option>
            </select>
            
            {preset === 'custom' && (
                <div className="flex items-center gap-2 border-l border-slate-800 pl-2 animation-fade-in">
                    <input 
                        type="date" 
                        value={from} 
                        onChange={(e) => setDates(e.target.value, to, 'custom')}
                        className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
                    />
                    <span className="text-slate-500 text-xs">до</span>
                    <input 
                        type="date" 
                        value={to} 
                        onChange={(e) => setDates(from, e.target.value, 'custom')}
                        className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
                    />
                </div>
            )}
        </div>
    );
}
