import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { FiUploadCloud } from 'react-icons/fi'
import { collection, addDoc, getDocs, deleteDoc, doc ,serverTimestamp,query, orderBy} from 'firebase/firestore'
import { db } from '../../../firebase-config'
import { v4 as uuidv4 } from 'uuid'

const categories = ['All', 'Breakfast', 'Lunch', 'Dinner']

const MealCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow overflow-hidden flex flex-col h-full animate-pulse">
    <div className="relative h-40 sm:h-48 md:h-60 lg:h-72 w-full shimmer bg-gray-200" />
    <div className="p-4 flex flex-col flex-grow space-y-2">
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
      <div className="h-3 w-full bg-gray-200 rounded" />
      <div className="h-3 w-5/6 bg-gray-200 rounded" />
      <div className="h-4 w-16 mt-1 bg-gray-200 rounded" />
      <div className="flex flex-wrap gap-1 mt-1">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
        <div className="h-5 w-14 bg-gray-200 rounded-full" />
      </div>
    </div>
  </div>
)

export default function Meals() {
  // --- State ---
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [filterTag, setFilterTag] = useState('')
  const [allTags, setAllTags] = useState([]);
  const [showModal, setShowModal] = useState(false)
  const [editIndex, setEditIndex] = useState(null)
  const [mealName, setMealName] = useState('')
  const [description, setDescription] = useState('')
  const [calories, setCalories] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Breakfast')
  const [dietType, setDietType] = useState('Balanced')
  const [goodFor, setGoodFor] = useState([])
  const [available, setAvailable] = useState(true)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dietTypes, setDietTypes] = useState(['Balanced', 'Keto', 'Vegan', 'Low Carb', 'Paleo']);
  const [showAddDietModal, setShowAddDietModal] = useState(false);
  const [newDietType, setNewDietType] = useState('');
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [newTag, setNewTag] = useState('');
  const dropRef = useRef()
  const fileInputRef = useRef()
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');


useEffect(() => {
  const DEFAULT_DIET_TYPES = ['Balanced', 'Keto', 'Vegan', 'Low Carb', 'Paleo']

  const fetchAndEnsureDietTypes = async () => {
    try {
      // 1. Ensure default diet types are in Firestore
      const snapshot = await getDocs(collection(db, 'dietTypes'))
      const namesInDb = snapshot.docs.map(doc => doc.data().name?.trim())

      const missingDefaults = DEFAULT_DIET_TYPES.filter(
        name => !namesInDb.includes(name)
      )

      for (const name of missingDefaults) {
        await addDoc(collection(db, 'dietTypes'), {
          name,
          createdAt: serverTimestamp()
        })
      }

      // 2. Fetch all sorted by createdAt
      const sortedSnapshot = await getDocs(
        query(collection(db, 'dietTypes'), orderBy('createdAt', 'asc'))
      )

      const sortedNames = sortedSnapshot.docs
        .map(d => d.data().name?.trim())
        .filter(Boolean)

      // 3. Move defaults to front, preserve custom order
      const custom = sortedNames.filter(name => !DEFAULT_DIET_TYPES.includes(name))
      setDietTypes([...DEFAULT_DIET_TYPES, ...custom])
    } catch (err) {
      console.error('Error fetching diet types:', err)
      toast.error('Failed to load diet types')
    } finally {
      setLoading(false)
    }
  }

  fetchAndEnsureDietTypes()
}, [])


  // --- Fetch Meals ---
  const fetchMeals = async () => {
    setLoading(true)
    try {
      const snapshot = await getDocs(collection(db, 'meals'))
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMeals(data)
    } catch (err) {
      toast.error("Failed to load meals")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeals()
  }, [])


const fetchTags = async () => {
  try {
    const snap = await getDocs(query(collection(db, 'tags'), orderBy('createdAt', 'asc')));
    let tags = snap.docs
      .map(doc => doc.data().name?.trim())
      .filter(Boolean)
      .map(name => name.replace(/\b\w/g, l => l.toUpperCase())); // format consistently

    // Remove duplicates (case-insensitive)
    tags = [...new Set(tags.map(t => t.toLowerCase()))].map(t =>
      t.replace(/\b\w/g, l => l.toUpperCase())
    );

    if (tags.length === 0) {
      const defaultTags = ['Diabetes', 'Hypertension', 'Heart Disease', 'Thyroid Disorder'];
      for (const tag of defaultTags) {
        await addDoc(collection(db, 'tags'), { name: tag, createdAt: serverTimestamp() });
      }
      tags = defaultTags;
    }

    setAllTags(tags);
  } catch (err) {
    toast.error("Failed to load tags.");
    console.error(err);
  }
};


useEffect(() => {
  fetchTags()
}, [])

  // --- Handlers ---
  const resetForm = () => {
    setMealName(''); setDescription('')
    setCalories(''); setPrice('')
    setCategory('Breakfast'); setDietType('Balanced')
    setGoodFor([]); setAvailable(true)
    setImage(null); setPreview(null); setEditIndex(null)
    setProtein('');
    setCarbs('');
    setFat('');

  }

  const toggleTag = tag =>
    setGoodFor(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])

  const onFileInputChange = e => {
    const f = e.target.files?.[0]
    if (f) {
      setImage(f)
      setPreview(URL.createObjectURL(f))
    }
  }

  const onDrop = e => {
    e.preventDefault()
    if (e.dataTransfer.files.length) {
      setImage(e.dataTransfer.files[0])
      setPreview(URL.createObjectURL(e.dataTransfer.files[0]))
    }
  }
  const allowDragOver = e => e.preventDefault()

  const handleEdit = idx => {
    const m = meals[idx]
    setMealName(m.mealName); setDescription(m.description)
    setCalories(m.calories); setPrice(m.price)
    setCategory(m.category); setDietType(m.dietType)
    setGoodFor(m.goodFor || []); setAvailable(m.available)
    setPreview(m.image); setEditIndex(idx); setShowModal(true)
    setProtein(m.protein || '');
    setCarbs(m.carbs || '');
    setFat(m.fat || '');

  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      let imgUrl = preview
      let imageDeleteUrl = null

      // Delete old image from imgbb if editing and uploading new one
      if (editIndex !== null && image && meals[editIndex]?.imageDeleteUrl) {
        try {
          await fetch(meals[editIndex].imageDeleteUrl) // delete via link
        } catch (err) {
          console.warn('Failed to delete old image from ImgBB', err)
        }
      }

      if (image) {
        const apiKey = '5d3311f90ffc71914620a8d5c008eb9a'
        const formData = new FormData()
        formData.append('image', image)

        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: formData
        })

        const data = await res.json()
        if (!data.success) throw new Error('ImgBB upload failed')
        imgUrl = data.data.url
        imageDeleteUrl = data.data.delete_url
      }

      const obj = {
        mealName,
        description,
        calories: +calories,
        price: +price,
        category,
        dietType,
        goodFor,
        available,
        image: imgUrl,
        imageDeleteUrl,
        protein: +protein,
        carbs: +carbs,
        fat: +fat,
      };

      if (editIndex !== null) {
        const id = meals[editIndex].id
        await deleteDoc(doc(db, 'meals', id))
        const newDoc = await addDoc(collection(db, 'meals'), obj)
        const arr = [...meals]; arr[editIndex] = { id: newDoc.id, ...obj }
        setMeals(arr)
        toast.success('Meal updated!')
      } else {
        const newDoc = await addDoc(collection(db, 'meals'), obj)
        setMeals([{ id: newDoc.id, ...obj }, ...meals])
        toast.success('Meal added!')
      }

      resetForm(); setShowModal(false)
    } catch (err) {
      console.error(err)
      toast.error('Save failed')
    }
  }



const confirmDelete = (idx) => {
  setDeleteIndex(idx);
  setShowDeleteModal(true);
};

const handleDelete = async () => {
  const m = meals[deleteIndex];
  if (!m) return;

  try {
    // 1. Delete image from ImgBB
    if (m.imageDeleteUrl) {
      await fetch(m.imageDeleteUrl)
    }

    // 2. Delete Firestore document
    await deleteDoc(doc(db, 'meals', m.id))

    // 3. Remove from local state
    setMeals(prev => prev.filter((_, i) => i !== deleteIndex))
    toast.success('Meal deleted!')
  } catch (err) {
    console.error(err)
    toast.error('Failed to delete meal')
  } finally {
    setShowDeleteModal(false)
    setDeleteIndex(null)
  }
}


  const filtered = meals.filter(m =>
    (activeFilter === 'All' || m.category === activeFilter) &&
    (!filterTag || m.goodFor.includes(filterTag))
  )

  return (
    <>
      <div className="p-6 bg-gray-100 min-h-screen">
        {/* Header + Filters */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Meals</h1>
          <button onClick={() => { resetForm(); setShowModal(true) }}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500">
            + Add Meal
          </button>
        </div>
        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm ${
                activeFilter === cat ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-700'
              }`}>
              {cat}
            </button>
          ))}
          <select onChange={e => setFilterTag(e.target.value)}
            className="border ml-auto px-3 py-1.5 rounded text-sm">
            <option value="">All Health Tags</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Meals Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <MealCardSkeleton key={i} />)}
          </div>
        ) : filtered.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m, i) => (
              <div key={i} className="bg-white rounded-xl shadow group relative flex flex-col h-full">
                <div className="relative h-40 sm:h-48 md:h-60 lg:h-72">
                  <img
                    src={m.image}
                    alt={m.mealName}
                    className={`h-full w-full object-cover ${!m.available && 'opacity-50 grayscale'}`}
                  />
                  {!m.available && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-lg font-bold">
                      Unavailable
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  
                  {/* Meal name + price in same row */}
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">{m.mealName}</h3>
                    <span className="text-sm text-green-600 font-semibold">₱{m.price.toFixed(2)}</span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">{m.description}</p>

                  {/* Calories + Macros */}
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span>
                      {m.calories} cal · {m.category} · {m.dietType}
                    </span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {m.protein}g Protein · {m.carbs}g Carbs · {m.fat}g Fats
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {m.goodFor.map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Edit/Delete Buttons */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleEdit(i)}
                    className="bg-yellow-400 text-white px-2 py-1 rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(i)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-8">No meals available.</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xl relative overflow-auto max-h-screen">
            <button onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-xl text-gray-400 hover:text-red-500">
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-indigo-600">
              {editIndex !== null ? 'Edit Meal' : 'Add New Meal'}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={mealName} onChange={e => setMealName(e.target.value)}
                placeholder="Meal Name" className="w-full border-b px-2 py-2" required />

              <input type="number" value={calories} onChange={e => setCalories(e.target.value)}
                placeholder="Calories" className="w-full border-b px-2 py-2" required />

              <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                placeholder="Price (₱)" className="w-full border-b px-2 py-2" required />

              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full border-b px-2 py-2">
                {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {/* ...inside your form layout in the modal... */}

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Diet Type */}
       <select
  value={dietType}
  onChange={(e) => {
    const value = e.target.value;
    if (value === '__add_new__') {
      setShowAddDietModal(true);
      return;
    }
    setDietType(value);
  }}
  className="w-full border-b px-2 py-2"
>
  {dietTypes.map((type) => (
    <option key={type} value={type}>{type}</option>
  ))}
  <option value="__add_new__" className="text-indigo-600">+ Add new diet type</option>
</select>


        {/* Availability */}
        <select
          value={available ? 'Available' : 'Unavailable'}
          onChange={(e) => setAvailable(e.target.value === 'Available')}
          className="w-full border-b px-2 py-2"
        >
          <option value="Available">Available</option>
          <option value="Unavailable">Unavailable</option>
        </select>
      </div>



{/* Macros Row */}
<div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
  <input
    type="number"
    value={protein}
    onChange={(e) => setProtein(e.target.value)}
    placeholder="Protein (g)"
    className="w-full border-b px-2 py-2"
  />
  <input
    type="number"
    value={carbs}
    onChange={(e) => setCarbs(e.target.value)}
    placeholder="Carbs (g)"
    className="w-full border-b px-2 py-2"
  />
  <input
    type="number"
    value={fat}
    onChange={(e) => setFat(e.target.value)}
    placeholder="Fat (g)"
    className="w-full border-b px-2 py-2"
  />
</div>

{/* Description Field */}
<textarea
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Description"
  className="col-span-1 md:col-span-2 border-b px-2 py-2 resize-none"
/>

              <div className="col-span-1 md:col-span-2">
                <div className="flex flex-wrap gap-2 items-center mb-2">
                  {allTags.map(tag => (
  <label key={tag} className="text-sm">
    <input type="checkbox" checked={goodFor.includes(tag)}
      onChange={() => toggleTag(tag)} className="mr-1" />
    {tag}
  </label>
))}

<button
  type="button"
  onClick={() => setShowAddTagModal(true)}
  className="text-indigo-600 text-sm underline ml-2"
>
  + Add new tag
</button>

                </div>
              </div>

            <div
  ref={dropRef}
  onClick={() => fileInputRef.current?.click()}
  onDrop={onDrop}
  onDragOver={allowDragOver}
  className="col-span-1 md:col-span-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500 cursor-pointer hover:bg-indigo-50 transition"
>
  <FiUploadCloud className="text-3xl mx-auto mb-2 text-indigo-500" />
  <p>Click or drag & drop image here</p>
  <input
    type="file"
    accept="image/*"
    onChange={onFileInputChange}
    className="hidden"
    ref={fileInputRef}
  />
</div>


              {preview && (
                <img src={preview} alt="Preview"
                  className="mt-3 w-full h-32 object-cover rounded-md shadow col-span-1 md:col-span-2" />
              )}

              <div className="col-span-1 md:col-span-2 flex justify-end">
                <button type="submit"
                  className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-indigo-500">
                  {editIndex !== null ? 'Update Meal' : 'Add Meal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAddDietModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative">
      <button onClick={() => setShowAddDietModal(false)}
        className="absolute top-3 right-4 text-xl text-gray-400 hover:text-red-500">
        &times;
      </button>
      <h2 className="text-lg font-bold mb-4 text-indigo-600">Add New Diet Type</h2>
<form onSubmit={async (e) => {
  e.preventDefault();
  let type = newDietType.trim();
  if (!type) return toast.error("Enter a valid diet type.");

  // Capitalize each word
  type = type.replace(/\b\w/g, l => l.toUpperCase());

  // Check for duplicates (case-insensitive match on formatted type)
  const exists = dietTypes.some(t => t.trim().toLowerCase() === type.toLowerCase());
  if (exists) {
    toast.error("Diet type already exists.");
    return;
  }

  try {
    await addDoc(collection(db, 'dietTypes'), { name: type, createdAt: serverTimestamp() });
    setDietTypes(prev => [...prev, type]);
    setDietType(type);
    setNewDietType('');
    setShowAddDietModal(false);
    toast.success("Diet type added!");
  } catch {
    toast.error("Failed to add diet type.");
  }
}}>


        <input
          type="text"
          value={newDietType}
          onChange={(e) => setNewDietType(e.target.value)}
          placeholder="e.g. Mediterranean"
          className="w-full border-b px-3 py-2 mb-4"
        />
        <div className="flex justify-end">
          <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-500">
            Add
          </button>
        </div>
      </form>
    </div>
  </div>
      )}
      {showAddTagModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative">
      <button onClick={() => setShowAddTagModal(false)}
        className="absolute top-3 right-4 text-xl text-gray-400 hover:text-red-500">
        &times;
      </button>
      <h2 className="text-lg font-bold mb-4 text-indigo-600">Add New Tag</h2>
      <form onSubmit={async (e) => {
  e.preventDefault();
  let tag = newTag.trim();
  if (!tag) return toast.error("Tag name required.");

  // Capitalize properly before checking for duplicates
  tag = tag.replace(/\b\w/g, l => l.toUpperCase());

  // Check if tag already exists (case-insensitive match on formatted tag)
  const exists = allTags.some(t => t.trim().toLowerCase() === tag.toLowerCase());
  if (exists) {
    toast.error("Tag already exists.");
    return;
  }

  try {
    await addDoc(collection(db, 'tags'), { name: tag, createdAt: serverTimestamp() });
    setAllTags(prev => [...prev, tag]);
    setGoodFor(prev => [...prev, tag]);
    setNewTag('');
    setShowAddTagModal(false);
    toast.success("Tag added!");
  } catch {
    toast.error("Failed to add tag.");
  }
}}>
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="e.g. Immunity Boost"
          className="w-full border-b px-3 py-2 mb-4"
        />
        <div className="flex justify-end">
          <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-500">
            Add
          </button>
        </div>
      </form>
    </div>
  </div>
      )}
      {showDeleteModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center relative">
      <h2 className="text-xl font-bold text-red-600 mb-4">Confirm Delete</h2>
      <p className="mb-6 text-gray-700">
        Are you sure you want to delete this meal?
      </p>
      <div className="flex justify-center gap-4">
        
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Yes
        </button>
        <button
          onClick={() => {
            setShowDeleteModal(false);
            setDeleteIndex(null);
          }}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

    </>
  )
}
