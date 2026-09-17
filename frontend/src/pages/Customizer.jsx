import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const Customizer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { backendUrl, token, addStandaloneCustomizedToCart, updateStandaloneCustomizedCartItem, standaloneBasePrice, standaloneObjectPrice, currency } = useContext(ShopContext);

    const editCartItem = location.state?.editCartItem;
    const [editMode, setEditMode] = useState(false);
    const [oldCustomKey, setOldCustomKey] = useState(null);

    const [tshirtColor, setTshirtColor] = useState('White');
    const [textInput, setTextInput] = useState('');
    const [textColor, setTextColor] = useState('#000000');
    const [textFont, setTextFont] = useState('Arial');
    const [selectedObjectId, setSelectedObjectId] = useState(null);
    const [interactionMode, setInteractionMode] = useState('none');
    const [isUploading, setIsUploading] = useState(false);
    const [libraryDesigns, setLibraryDesigns] = useState(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [baseTemplateUrl, setBaseTemplateUrl] = useState(assets.blank_tshirt);
    
    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);
    const objectRefs = useRef({});
    const [canvasScale, setCanvasScale] = useState(1);
    const dragRef = useRef({ isDragging: false, objId: null, startX: 0, startY: 0, initialObjX: 0, initialObjY: 0 });

    const LOGICAL_CANVAS_SIZE = 1000;
    const MAX_CUSTOMIZATION_OBJECTS = 10;
    
    const colors = [
        { name: 'White', value: '#FFFFFF' },
        { name: 'Black', value: '#222222' },
        { name: 'Red', value: '#D32F2F' },
        { name: 'Blue', value: '#1976D2' },
        { name: 'Green', value: '#388E3C' },
        { name: 'Yellow', value: '#FBC02D' }
    ];

    const fonts = ['Arial', 'Courier New', 'Times New Roman', 'Impact', 'Comic Sans MS'];

    const [objects, setObjects] = useState([]);

    // We define a static printable area based on our 1000x1000 canvas and the blank_tshirt image.
    // The t-shirt is centered, so the printable area is roughly in the middle chest area.
    const printableArea = {
        x: 300,
        y: 200,
        width: 400,
        height: 550
    };

    useEffect(() => {
        if (editCartItem) {
            setEditMode(true);
            setOldCustomKey(editCartItem.sizeOrCustomKey);
            setTshirtColor(editCartItem.colour || 'White');
            if (editCartItem.customization) {
                if (editCartItem.customization.baseTemplate) {
                    setBaseTemplateUrl(editCartItem.customization.baseTemplate);
                }
                if (editCartItem.customization.objects) {
                    setObjects(editCartItem.customization.objects);
                }
            }
        }
    }, [editCartItem]);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
                setCanvasScale(entries[0].contentRect.width / LOGICAL_CANVAS_SIZE);
            }
        });
        if (canvasRef.current) observer.observe(canvasRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId) {
                setObjects(prev => prev.filter(obj => obj.id !== selectedObjectId));
                setSelectedObjectId(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedObjectId]);

    const handlePointerDown = (e, objId) => {
        e.stopPropagation();
        setSelectedObjectId(objId);
        
        const obj = objects.find(o => o.id === objId);
        if (!obj) return;
        
        dragRef.current = {
            isDragging: true,
            objId: objId,
            startX: e.clientX,
            startY: e.clientY,
            initialObjX: obj.x,
            initialObjY: obj.y
        };
        
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
    };

    const handlePointerMove = (e) => {
        if (!dragRef.current.isDragging) return;
        const { objId, startX, startY, initialObjX, initialObjY } = dragRef.current;
        
        const dx = (e.clientX - startX) / canvasScale;
        const dy = (e.clientY - startY) / canvasScale;
        
        let newX = initialObjX + dx;
        let newY = initialObjY + dy;
        
        const node = objectRefs.current[objId];
        if (node) {
            const objHalfWidth = node.offsetWidth / 2;
            const objHalfHeight = node.offsetHeight / 2;
            
            const minX = printableArea.x + objHalfWidth;
            const maxX = printableArea.x + printableArea.width - objHalfWidth;
            const minY = printableArea.y + objHalfHeight;
            const maxY = printableArea.y + printableArea.height - objHalfHeight;
            
            newX = Math.max(minX, Math.min(newX, maxX));
            newY = Math.max(minY, Math.min(newY, maxY));
        }
        
        setObjects(prev => prev.map(o => o.id === objId ? { ...o, x: newX, y: newY } : o));
    };

    const handlePointerUp = () => {
        dragRef.current.isDragging = false;
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
    };

    const handleAddText = () => {
        if (objects.length >= MAX_CUSTOMIZATION_OBJECTS) {
            toast.error(`Maximum of ${MAX_CUSTOMIZATION_OBJECTS} objects reached.`);
            return;
        }

        const trimmed = textInput.trim();
        if (!trimmed) {
            toast.error('Please enter some text.');
            return;
        }
        if (trimmed.length > 100) {
            toast.error('Text cannot exceed 100 characters.');
            return;
        }
        
        let initialX = printableArea.x + (printableArea.width / 2);
        let initialY = printableArea.y + (printableArea.height / 2);
        let initialScale = 1;
        
        const fontSize = 48;
        const approxWidth = trimmed.length * (fontSize * 0.6);
        const approxHeight = fontSize;
        
        if (approxWidth > printableArea.width * 0.9) {
            initialScale = (printableArea.width * 0.9) / approxWidth;
        }
        
        const scaledWidth = approxWidth * initialScale;
        const scaledHeight = approxHeight * initialScale;
        
        const minX = printableArea.x + (scaledWidth / 2);
        const maxX = printableArea.x + printableArea.width - (scaledWidth / 2);
        const minY = printableArea.y + (scaledHeight / 2);
        const maxY = printableArea.y + printableArea.height - (scaledHeight / 2);
        
        if (minX <= maxX) initialX = Math.max(minX, Math.min(initialX, maxX));
        if (minY <= maxY) initialY = Math.max(minY, Math.min(initialY, maxY));
        
        const newObject = {
            id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'text',
            text: trimmed,
            color: textColor,
            font: textFont,
            x: initialX,
            y: initialY,
            fontSize: 48,
            scaleX: initialScale,
            scaleY: initialScale
        };
        
        setObjects(prev => [...prev, newObject]);
        setSelectedObjectId(newObject.id);
        setTextInput('');
    };

    const handleEditText = () => {
        const obj = objects.find(o => o.id === selectedObjectId);
        if (obj && obj.type === 'text') {
            setObjects(prev => prev.map(o => o.id === selectedObjectId ? { ...o, text: textInput || o.text, color: textColor, font: textFont } : o));
            setTextInput('');
        }
    };

    const handleDeleteObject = () => {
        setObjects(prev => prev.filter(obj => obj.id !== selectedObjectId));
        setSelectedObjectId(null);
    };

    const handleResizeObject = (deltaScale) => {
        setObjects(prev => prev.map(obj => {
            if (obj.id === selectedObjectId) {
                const newScale = obj.scaleX + deltaScale;
                if (newScale < 0.1) return obj;
                
                const node = objectRefs.current[obj.id];
                if (node) {
                    const ratio = newScale / obj.scaleX;
                    const newWidth = node.offsetWidth * ratio;
                    const newHeight = node.offsetHeight * ratio;
                    
                    if (newWidth < 20 || newHeight < 20) return obj;
                    if (newWidth > printableArea.width || newHeight > printableArea.height) return obj;
                    
                    const newHalfWidth = newWidth / 2;
                    const newHalfHeight = newHeight / 2;
                    
                    const minX = printableArea.x + newHalfWidth;
                    const maxX = printableArea.x + printableArea.width - newHalfWidth;
                    const minY = printableArea.y + newHalfHeight;
                    const maxY = printableArea.y + printableArea.height - newHalfHeight;
                    
                    const clampedX = Math.max(minX, Math.min(obj.x, maxX));
                    const clampedY = Math.max(minY, Math.min(obj.y, maxY));
                    
                    return { ...obj, scaleX: newScale, scaleY: newScale, x: clampedX, y: clampedY };
                }
                
                return { ...obj, scaleX: newScale, scaleY: newScale };
            }
            return obj;
        }));
    };

    const handleImageUpload = async (e) => {
        if (objects.length >= MAX_CUSTOMIZATION_OBJECTS) {
            toast.error(`Maximum of ${MAX_CUSTOMIZATION_OBJECTS} objects reached.`);
            e.target.value = '';
            return;
        }

        const file = e.target.files[0];
        if (!file) return;
        
        e.target.value = '';
        
        if (!token) {
            toast.error('Please login first to upload designs.');
            return;
        }
        
        const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Unsupported image format. Use PNG, JPG, or WEBP.');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be 5 MB or smaller.');
            return;
        }
        
        setIsUploading(true);
        
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await axios.post(backendUrl + '/api/customizer/upload', formData, {
                headers: { token }
            });
            
            if (response.data.success) {
                const imgUrl = response.data.imageUrl;
                
                const img = new Image();
                img.onload = () => {
                    let initWidth = img.width;
                    let initHeight = img.height;
                    
                    const maxW = printableArea.width * 0.6;
                    const maxH = printableArea.height * 0.6;
                    
                    const ratio = Math.min(maxW / initWidth, maxH / initHeight, 1);
                    initWidth *= ratio;
                    initHeight *= ratio;
                    
                    let initialX = printableArea.x + printableArea.width / 2;
                    let initialY = printableArea.y + printableArea.height / 2;
                    
                    const newObject = {
                        id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        type: 'image',
                        imageUrl: imgUrl,
                        x: initialX,
                        y: initialY,
                        width: initWidth,
                        height: initHeight,
                        scaleX: 1,
                        scaleY: 1
                    };
                    
                    setObjects(prev => [...prev, newObject]);
                    setSelectedObjectId(newObject.id);
                    setInteractionMode('none');
                    setIsUploading(false);
                };
                img.onerror = () => {
                    toast.error("Uploaded image could not be loaded.");
                    setIsUploading(false);
                };
                img.src = imgUrl;
                
            } else {
                toast.error(response.data.message || 'Unable to upload design. Please try again.');
                setIsUploading(false);
            }
        } catch (err) {
            console.log(err);
            toast.error('Unable to upload design. Please try again.');
            setIsUploading(false);
        }
    };

    const handleAddDesign = (design) => {
        if (objects.length >= MAX_CUSTOMIZATION_OBJECTS) {
            toast.error(`Maximum of ${MAX_CUSTOMIZATION_OBJECTS} objects reached.`);
            return;
        }

        const img = new Image();
        img.onload = () => {
            let initWidth = img.width;
            let initHeight = img.height;
            
            const maxW = printableArea.width * 0.6;
            const maxH = printableArea.height * 0.6;
            
            const ratio = Math.min(maxW / initWidth, maxH / initHeight, 1);
            initWidth *= ratio;
            initHeight *= ratio;
            
            let initialX = printableArea.x + printableArea.width / 2;
            let initialY = printableArea.y + printableArea.height / 2;
            
            const newObject = {
                id: `design-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'design',
                designId: design._id,
                imageUrl: design.image,
                name: design.name,
                category: design.category,
                x: initialX,
                y: initialY,
                width: initWidth,
                height: initHeight,
                scaleX: 1,
                scaleY: 1
            };
            
            setObjects(prev => [...prev, newObject]);
            setSelectedObjectId(newObject.id);
            setInteractionMode('none');
        };
        img.onerror = () => {
            toast.error("Design image could not be loaded.");
        };
        img.src = design.image;
    };

    const handleSetBaseTemplate = (design) => {
        setBaseTemplateUrl(design.image);
    };

    const handleAddToCart = async () => {
        if (objects.length === 0 && baseTemplateUrl === assets.blank_tshirt) {
            toast.error("Please add at least one design, text, or select a base template.");
            return;
        }
        
        const customizationPayload = {
            baseTemplate: baseTemplateUrl,
            colour: tshirtColor,
            objects: objects
        };

        if (editMode && oldCustomKey) {
            await updateStandaloneCustomizedCartItem(oldCustomKey, tshirtColor, customizationPayload, editCartItem?.quantity || 1);
            navigate('/cart');
        } else {
            await addStandaloneCustomizedToCart(tshirtColor, customizationPayload, 1);
            navigate('/cart');
        }
    };

    useEffect(() => {
        const fetchDesigns = async () => {
            try {
                const res = await axios.get(backendUrl + '/api/customizer/designs');
                if (res.data.success) {
                    setLibraryDesigns(res.data.designs);
                } else {
                    setLibraryDesigns([]);
                }
            } catch (err) {
                console.log(err);
                setLibraryDesigns([]);
            }
        };
        fetchDesigns();
    }, [backendUrl]);


    // Effect to handle selecting an object and populating text edit fields
    useEffect(() => {
        if (selectedObjectId) {
            const obj = objects.find(o => o.id === selectedObjectId);
            if (obj && obj.type === 'text') {
                setTextInput(obj.text);
                setTextColor(obj.color || '#000000');
                setTextFont(obj.font || 'Arial');
            } else {
                setTextInput('');
            }
        }
    }, [selectedObjectId, objects]);

    const activeColorHex = colors.find(c => c.name === tshirtColor)?.value || '#FFFFFF';
    const isColorDark = ['Black', 'Blue', 'Red', 'Green'].includes(tshirtColor);

    const currentPrice = standaloneBasePrice + (objects.length * standaloneObjectPrice);

    return (
        <div className="py-10 border-t">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-medium mb-2">AUVEN CUSTOMIZER</h1>
                <p className="text-gray-500">Design your own standalone T-shirt</p>
            </div>

            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 px-4">
                {/* Canvas Area */}
                <div className="flex-1 flex flex-col items-center">
                    <div className="w-full max-w-[500px]">
                        <h2 className="text-xl font-bold mb-4">Preview</h2>
                    </div>
                    <div 
                        className={`w-full max-w-[500px] aspect-square relative bg-gray-100 border shadow-sm rounded overflow-hidden select-none ${isPreviewMode ? 'pointer-events-none' : ''}`}
                        ref={canvasRef}
                        onClick={() => { if(!isPreviewMode) { setSelectedObjectId(null); setInteractionMode('none'); } }}
                    >
                        
                        {/* Layer 1: Colored Background matching t-shirt shape */}
                        <div 
                            className="absolute inset-0 z-0" 
                            style={{ 
                                backgroundColor: activeColorHex,
                                maskImage: `url(${baseTemplateUrl})`,
                                WebkitMaskImage: `url(${baseTemplateUrl})`,
                                maskSize: 'contain',
                                WebkitMaskSize: 'contain',
                                maskPosition: 'center',
                                WebkitMaskPosition: 'center',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat'
                            }}
                        ></div>

                        {/* Layer 2: T-shirt Base Template with Multiply blend mode to tint it */}
                        <img 
                            src={baseTemplateUrl} 
                            alt="T-shirt Template"
                            className="absolute inset-0 w-full h-full object-contain z-10 mix-blend-multiply opacity-90"
                            style={{ pointerEvents: 'none' }}
                        />

                        {/* Printable Area Guide (Visible in Edit Mode) */}
                        {!isPreviewMode && (
                            <div 
                                className="absolute border border-dashed border-gray-400 z-20 pointer-events-none transition-opacity opacity-50"
                                style={{
                                    left: `${(printableArea.x / LOGICAL_CANVAS_SIZE) * 100}%`,
                                    top: `${(printableArea.y / LOGICAL_CANVAS_SIZE) * 100}%`,
                                    width: `${(printableArea.width / LOGICAL_CANVAS_SIZE) * 100}%`,
                                    height: `${(printableArea.height / LOGICAL_CANVAS_SIZE) * 100}%`
                                }}
                            >
                                <span className="absolute -top-6 left-0 text-xs text-gray-500 bg-white/80 px-1 rounded">Printable Area</span>
                            </div>
                        )}

                        {/* Layer 3: Dynamic Objects */}
                        <div className="absolute inset-0 z-30 pointer-events-none">
                            {objects.map(obj => {
                                const isSelected = obj.id === selectedObjectId && !isPreviewMode;
                                const isMoveMode = isSelected;
                                
                                const pxLeft = obj.x * canvasScale;
                                const pxTop = obj.y * canvasScale;

                                return (
                                    <div
                                        key={obj.id}
                                        ref={el => objectRefs.current[obj.id] = el}
                                        className={`absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto
                                            ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-1 hover:ring-gray-300'}
                                            ${isMoveMode ? 'cursor-move' : ''}
                                        `}
                                        style={{
                                            left: `${pxLeft}px`,
                                            top: `${pxTop}px`,
                                            transform: `translate(-50%, -50%) scale(${obj.scaleX})`,
                                            zIndex: isSelected ? 40 : 30
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedObjectId(obj.id);
                                        }}
                                        onPointerDown={(e) => handlePointerDown(e, obj.id)}
                                    >
                                        {obj.type === 'text' && (
                                            <span 
                                                style={{ 
                                                    fontSize: `${obj.fontSize}px`,
                                                    color: obj.color || '#000000',
                                                    fontFamily: obj.font || 'Arial',
                                                    whiteSpace: 'nowrap',
                                                    lineHeight: 1
                                                }}
                                            >
                                                {obj.text}
                                            </span>
                                        )}
                                        
                                        {(obj.type === 'image' || obj.type === 'design') && (
                                            <img 
                                                src={obj.imageUrl} 
                                                alt="Custom Element" 
                                                style={{ width: `${obj.width}px`, height: `${obj.height}px` }} 
                                                className="object-contain pointer-events-none"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="w-full max-w-[500px] mt-4 flex justify-between items-center">
                        <button 
                            onClick={() => setIsPreviewMode(!isPreviewMode)}
                            className="text-sm underline text-gray-600 hover:text-black"
                        >
                            {isPreviewMode ? 'Exit Preview' : 'Preview Mode'}
                        </button>
                        <span className="text-xs text-gray-500">
                            {objects.length} / {MAX_CUSTOMIZATION_OBJECTS} Objects Used
                        </span>
                    </div>
                </div>

                {/* Controls Area */}
                <div className="flex-1 max-w-[500px] flex flex-col gap-6">
                    
                    {/* T-Shirt Color */}
                    <div className="bg-gray-50 p-4 border rounded">
                        <h3 className="font-semibold mb-3">T-Shirt Color</h3>
                        <div className="flex gap-2">
                            {colors.map(c => (
                                <button
                                    key={c.name}
                                    onClick={() => setTshirtColor(c.name)}
                                    className={`w-8 h-8 rounded-full border-2 ${tshirtColor === c.name ? 'border-blue-500 scale-110' : 'border-gray-300'} transition-all`}
                                    style={{ backgroundColor: c.value }}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Add / Edit Text */}
                    <div className="bg-gray-50 p-4 border rounded">
                        <h3 className="font-semibold mb-3">Add / Edit Text</h3>
                        <div className="flex flex-col gap-3">
                            <input 
                                type="text" 
                                value={textInput} 
                                onChange={(e) => setTextInput(e.target.value)} 
                                placeholder="Enter your text..." 
                                className="border px-3 py-2 w-full"
                                maxLength={100}
                            />
                            
                            <div className="flex gap-2">
                                <div className="flex-1 flex flex-col gap-1">
                                    <label className="text-xs text-gray-500">Font Color</label>
                                    <input 
                                        type="color" 
                                        value={textColor}
                                        onChange={(e) => setTextColor(e.target.value)}
                                        className="h-10 w-full cursor-pointer"
                                    />
                                </div>
                                <div className="flex-[2] flex flex-col gap-1">
                                    <label className="text-xs text-gray-500">Font Family</label>
                                    <select 
                                        value={textFont} 
                                        onChange={(e) => setTextFont(e.target.value)} 
                                        className="border px-3 py-2 h-10"
                                    >
                                        {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button onClick={handleAddText} className="flex-1 bg-black text-white px-4 py-2 hover:bg-gray-800">
                                    Add New Text
                                </button>
                                {selectedObjectId && objects.find(o => o.id === selectedObjectId)?.type === 'text' && (
                                    <button onClick={handleEditText} className="flex-1 bg-white border border-black text-black px-4 py-2 hover:bg-gray-100">
                                        Update Selected
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Object Controls */}
                    {selectedObjectId && (
                        <div className="bg-blue-50 p-4 border border-blue-200 rounded">
                            <h3 className="font-semibold mb-3 text-blue-900">Edit Selected Object</h3>
                            <div className="flex gap-2 mb-3">
                                <button 
                                    onClick={() => handleResizeObject(0.1)}
                                    className="flex-1 px-3 py-2 text-sm border bg-white text-gray-700 hover:bg-gray-50"
                                    title="Increase Size"
                                >
                                    Increase Size
                                </button>
                                <button 
                                    onClick={() => handleResizeObject(-0.1)}
                                    className="flex-1 px-3 py-2 text-sm border bg-white text-gray-700 hover:bg-gray-50"
                                    title="Decrease Size"
                                >
                                    Decrease Size
                                </button>
                                <button 
                                    onClick={handleDeleteObject}
                                    className="px-3 py-2 text-sm border bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                    title="Delete Object"
                                >
                                    Delete
                                </button>
                            </div>
                            <p className="text-xs text-blue-600 italic">Drag the object on the canvas to move it.</p>
                        </div>
                    )}

                    {/* Image / Design Library */}
                    <div className="bg-gray-50 p-4 border rounded">
                        <h3 className="font-semibold mb-3">Add Images & Designs</h3>
                        
                        <div className="mb-4 border-b pb-4">
                            <p className="text-sm text-gray-600 mb-2">Upload your own image (PNG, JPG, WEBP - Max 5MB)</p>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="file" 
                                    accept="image/png, image/jpeg, image/webp" 
                                    onChange={handleImageUpload} 
                                    ref={fileInputRef}
                                    className="hidden"
                                />
                                <button 
                                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                    disabled={isUploading}
                                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                                >
                                    {isUploading ? 'Uploading...' : 'Choose File'}
                                </button>
                                {isUploading && <span className="text-xs text-gray-500 animate-pulse">Processing...</span>}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-2">Or choose from our Library</p>
                            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-white border">
                                {libraryDesigns === null ? (
                                    <p className="text-xs text-gray-500 col-span-4 p-2 text-center">Loading designs...</p>
                                ) : libraryDesigns.length === 0 ? (
                                    <p className="text-xs text-gray-500 col-span-4 p-2 text-center">No designs available.</p>
                                ) : (
                                    libraryDesigns.map(design => (
                                        <div 
                                            key={design._id} 
                                            className="group relative aspect-square border border-gray-200 rounded p-1 flex items-center justify-center bg-gray-50 overflow-hidden"
                                            title={design.name}
                                        >
                                            <img src={design.image} alt={design.name} className="w-full h-full object-contain pointer-events-none" />
                                            
                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                                <button 
                                                    onClick={() => handleSetBaseTemplate(design)}
                                                    className="w-full text-[10px] leading-tight bg-white text-black py-1 rounded hover:bg-gray-200"
                                                >
                                                    Set Base
                                                </button>
                                                <button 
                                                    onClick={() => handleAddDesign(design)}
                                                    className="w-full text-[10px] leading-tight bg-blue-500 text-white py-1 rounded hover:bg-blue-600"
                                                >
                                                    Add Graphic
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-auto pt-6 border-t">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <span className="text-gray-600 font-medium">Total Price:</span>
                            <span className="text-xl font-bold">{currency}{currentPrice}</span>
                        </div>
                        <button 
                            onClick={handleAddToCart} 
                            className='w-full bg-black text-white px-8 py-4 font-medium hover:bg-gray-800 transition-colors'
                        >
                            {editMode ? 'UPDATE CART' : 'ADD TO CART'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Customizer;
