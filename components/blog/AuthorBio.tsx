interface AuthorBioProps {
  author: {
    name: string;
    bio?: string;
    avatar?: string;
  };
}

export default function AuthorBio({ author }: AuthorBioProps) {
  return (
    <div className="border rounded-lg p-6">
      <h3 className="font-semibold text-lg mb-2">About {author.name}</h3>
      <p className="text-gray-600">{author.bio || 'No bio available.'}</p>
    </div>
  );
}