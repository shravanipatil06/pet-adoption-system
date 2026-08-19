function PetCard({ name, breed, age, gender, image, onViewDetails }) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-purple-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">

      <img
        src={image}
        alt={name}
        className="w-full h-56 object-cover"
      />

      <div className="p-6">

        <h3 className="text-xl font-bold text-slate-800">
          {name}
        </h3>

        <p className="text-purple-600 font-medium mt-2">
          {breed}
        </p>

        <p className="text-slate-500 mt-1">
          {age} years • {gender}
        </p>

        <button
          onClick={onViewDetails}
          className="mt-5 w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition"
        >
          View Details
        </button>

      </div>

    </div>
  )
}

export default PetCard