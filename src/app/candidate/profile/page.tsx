import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CandidateProfilePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your professional information</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Profile
        </Button>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-emerald-600 font-semibold">JD</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">John Doe</h3>
              <p className="text-gray-600 mb-4">Senior Software Engineer</p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📍 San Francisco, CA</p>
                <p>💼 Full-time</p>
                <p>🎯 Open to opportunities</p>
              </div>
              <Button variant="outline" className="w-full mt-4 border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                Upload Photo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600 mb-1">12</div>
              <div className="text-sm text-gray-600">Applications</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">5</div>
              <div className="text-sm text-gray-600">Interviews</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">8</div>
              <div className="text-sm text-gray-600">Saved Jobs</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value="John"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value="Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  readOnly
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value="john.doe@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value="+1 (555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                readOnly
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Skills & Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'MongoDB', 'TypeScript'].map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Experience */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Work Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-emerald-500 pl-4">
              <h4 className="font-semibold text-gray-900">Senior Software Engineer</h4>
              <p className="text-gray-600">Tech Company Inc.</p>
              <p className="text-sm text-gray-500">Jan 2022 - Present</p>
              <p className="text-gray-700 mt-2">
                Led development of scalable web applications using React and Node.js. 
                Mentored junior developers and implemented best practices.
              </p>
            </div>
            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900">Software Engineer</h4>
              <p className="text-gray-600">Startup XYZ</p>
              <p className="text-sm text-gray-500">Mar 2020 - Dec 2021</p>
              <p className="text-gray-700 mt-2">
                Built and maintained web applications. Collaborated with cross-functional teams 
                to deliver high-quality software solutions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
